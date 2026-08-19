import { Injectable, UnauthorizedException } from "@nestjs/common";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { AuthConfigService } from "./auth-config.service";
import type { Request, Response } from "express";
import type { SessionUser, TelegramOidcTransaction } from "./auth.types";

const TRANSACTION_COOKIE = "inferno_telegram_oidc";
const SESSION_COOKIE = "inferno_session";
const TRANSACTION_MAX_AGE_MS = 10 * 60 * 1000;
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const ISSUER = "inferno";
const TRANSACTION_AUDIENCE = "inferno:telegram-oidc";
const SESSION_AUDIENCE = "inferno:client";

interface TransactionClaims extends JWTPayload {
  codeVerifier: string;
  nonce: string;
  state: string;
  type: "telegram_oidc";
}

interface SessionClaims extends JWTPayload {
  name?: string;
  photoUrl?: string;
  telegramNumericId?: string;
  type: "session";
  username?: string;
}

@Injectable()
export class AuthSessionService {
  constructor(private readonly authConfig: AuthConfigService) {}

  async createTransactionToken(
    transaction: TelegramOidcTransaction,
  ): Promise<string> {
    return new SignJWT({
      codeVerifier: transaction.codeVerifier,
      nonce: transaction.nonce,
      state: transaction.state,
      type: "telegram_oidc",
    } satisfies Omit<TransactionClaims, keyof JWTPayload>)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(ISSUER)
      .setAudience(TRANSACTION_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(this.authConfig.getSessionSecret());
  }

  async verifyTransactionToken(
    token: string,
  ): Promise<TelegramOidcTransaction> {
    try {
      const { payload } = await jwtVerify(
        token,
        this.authConfig.getSessionSecret(),
        {
          algorithms: ["HS256"],
          audience: TRANSACTION_AUDIENCE,
          issuer: ISSUER,
        },
      );

      if (
        payload.type !== "telegram_oidc" ||
        typeof payload.state !== "string" ||
        typeof payload.codeVerifier !== "string" ||
        typeof payload.nonce !== "string"
      ) {
        throw new UnauthorizedException("Invalid authentication transaction");
      }

      return {
        codeVerifier: payload.codeVerifier,
        nonce: payload.nonce,
        state: payload.state,
      };
    } catch {
      throw new UnauthorizedException("Invalid authentication transaction");
    }
  }

  async createSessionToken(user: SessionUser): Promise<string> {
    return new SignJWT({
      name: user.name,
      photoUrl: user.photoUrl,
      telegramNumericId: user.telegramNumericId,
      type: "session",
      username: user.username,
    } satisfies Omit<SessionClaims, keyof JWTPayload>)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(ISSUER)
      .setAudience(SESSION_AUDIENCE)
      .setSubject(user.telegramId)
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(this.authConfig.getSessionSecret());
  }

  async verifySessionToken(token: string): Promise<SessionUser> {
    try {
      const { payload } = await jwtVerify(
        token,
        this.authConfig.getSessionSecret(),
        {
          algorithms: ["HS256"],
          audience: SESSION_AUDIENCE,
          issuer: ISSUER,
        },
      );

      if (payload.type !== "session" || typeof payload.sub !== "string") {
        throw new UnauthorizedException("Invalid session");
      }

      return {
        telegramId: payload.sub,
        ...this.readOptionalSessionClaims(payload),
      };
    } catch {
      throw new UnauthorizedException("Invalid session");
    }
  }

  getTransactionCookie(request: Request): string | undefined {
    return this.readCookie(request, TRANSACTION_COOKIE);
  }

  getSessionCookie(request: Request): string | undefined {
    return this.readCookie(request, SESSION_COOKIE);
  }

  setTransactionCookie(response: Response, token: string): void {
    response.cookie(
      TRANSACTION_COOKIE,
      token,
      this.authConfig.getCookieOptions(TRANSACTION_MAX_AGE_MS),
    );
  }

  clearTransactionCookie(response: Response): void {
    response.clearCookie(
      TRANSACTION_COOKIE,
      this.authConfig.getClearCookieOptions(),
    );
  }

  setSessionCookie(response: Response, token: string): void {
    response.cookie(
      SESSION_COOKIE,
      token,
      this.authConfig.getCookieOptions(SESSION_MAX_AGE_MS),
    );
  }

  clearSessionCookie(response: Response): void {
    response.clearCookie(
      SESSION_COOKIE,
      this.authConfig.getClearCookieOptions(),
    );
  }

  private readCookie(request: Request, name: string): string | undefined {
    const cookies: unknown = request.cookies;

    if (!this.isRecord(cookies)) {
      return undefined;
    }

    const value = cookies[name];
    return typeof value === "string" ? value : undefined;
  }

  private readOptionalSessionClaims(
    payload: JWTPayload,
  ): Omit<SessionUser, "telegramId"> {
    return {
      ...(typeof payload.telegramNumericId === "string"
        ? { telegramNumericId: payload.telegramNumericId }
        : {}),
      ...(typeof payload.name === "string" ? { name: payload.name } : {}),
      ...(typeof payload.username === "string"
        ? { username: payload.username }
        : {}),
      ...(typeof payload.photoUrl === "string"
        ? { photoUrl: payload.photoUrl }
        : {}),
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
}
