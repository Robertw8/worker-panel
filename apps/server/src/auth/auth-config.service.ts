import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions } from "express";
import type { TelegramOidcConfig } from "./auth.types";

const MINIMUM_SESSION_SECRET_LENGTH = 32;

@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  getTelegramConfig(): TelegramOidcConfig {
    return {
      clientId: this.requireValue("TELEGRAM_CLIENT_ID"),
      clientSecret: this.requireValue("TELEGRAM_CLIENT_SECRET"),
      redirectUri: this.requireUrl("TELEGRAM_REDIRECT_URI"),
    };
  }

  getClientLoginUrl(status?: "error" | "success"): string {
    const clientUrl = new URL(this.requireUrl("CLIENT_URL"));
    const redirectUrl = new URL(
      status === "success" ? "/dashboard" : "/login",
      clientUrl,
    );

    if (status === "error") {
      redirectUrl.searchParams.set("auth", status);
    }

    return redirectUrl.toString();
  }

  getSessionSecret(): Uint8Array {
    const secret = this.requireValue("SESSION_SECRET");

    if (secret.length < MINIMUM_SESSION_SECRET_LENGTH) {
      throw new ServiceUnavailableException(
        "Authentication is not configured",
      );
    }

    return new TextEncoder().encode(secret);
  }

  getCookieOptions(maxAge: number): CookieOptions {
    return {
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax",
      secure: this.configService.get<string>("NODE_ENV") === "production",
    };
  }

  getClearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: this.configService.get<string>("NODE_ENV") === "production",
    };
  }

  private requireUrl(name: string): string {
    const value = this.requireValue(name);

    try {
      const url = new URL(value);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Unsupported URL protocol");
      }

      return url.toString();
    } catch {
      throw new ServiceUnavailableException(
        "Authentication is not configured",
      );
    }
  }

  private requireValue(name: string): string {
    const value = this.configService.get<string>(name)?.trim();

    if (!value) {
      throw new ServiceUnavailableException(
        "Authentication is not configured",
      );
    }

    return value;
  }
}
