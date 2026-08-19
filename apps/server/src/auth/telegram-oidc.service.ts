import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { AuthConfigService } from "./auth-config.service";
import type {
  SessionUser,
  TelegramAuthorizationRequest,
  TelegramOidcTransaction,
  TelegramTokenResponse,
} from "./auth.types";

const AUTHORIZATION_URL = "https://oauth.telegram.org/auth";
const TOKEN_URL = "https://oauth.telegram.org/token";
const JWKS_URL = "https://oauth.telegram.org/.well-known/jwks.json";
const ISSUER = "https://oauth.telegram.org";
const CLOCK_TOLERANCE_SECONDS = 60;

interface ValidTelegramPayload extends JWTPayload {
  exp: number;
  iat: number;
  sub: string;
}

@Injectable()
export class TelegramOidcService {
  private readonly telegramJwks = createRemoteJWKSet(new URL(JWKS_URL));

  constructor(private readonly authConfig: AuthConfigService) {}

  createAuthorizationRequest(): TelegramAuthorizationRequest {
    const config = this.authConfig.getTelegramConfig();

    const transaction: TelegramOidcTransaction = {
      codeVerifier: randomBytes(32).toString("base64url"),
      nonce: randomBytes(32).toString("base64url"),
      state: randomBytes(32).toString("base64url"),
    };

    const codeChallenge = createHash("sha256")
      .update(transaction.codeVerifier)
      .digest("base64url");

    const authorizationUrl = new URL(AUTHORIZATION_URL);

    authorizationUrl.search = new URLSearchParams({
      client_id: config.clientId,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce: transaction.nonce,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: "openid profile",
      state: transaction.state,
    }).toString();

    return {
      authorizationUrl: authorizationUrl.toString(),
      transaction,
    };
  }

  async exchangeCode(
    code: string,
    codeVerifier: string,
  ): Promise<TelegramTokenResponse> {
    const config = this.authConfig.getTelegramConfig();
    const authorization = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString("base64");

    let response: globalThis.Response;

    try {
      response = await fetch(TOKEN_URL, {
        body: new URLSearchParams({
          client_id: config.clientId,
          code,
          code_verifier: codeVerifier,
          grant_type: "authorization_code",
          redirect_uri: config.redirectUri,
        }),
        headers: {
          Authorization: `Basic ${authorization}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });
    } catch {
      throw new BadGatewayException(
        "Telegram authentication is temporarily unavailable",
      );
    }

    if (!response.ok) {
      throw new UnauthorizedException("Telegram authentication failed");
    }

    const payload: unknown = await response.json();

    if (!this.isRecord(payload) || typeof payload.id_token !== "string") {
      throw new UnauthorizedException("Telegram authentication failed");
    }

    return { idToken: payload.id_token };
  }

  async verifyIdToken(idToken: string, nonce: string): Promise<SessionUser> {
    const config = this.authConfig.getTelegramConfig();

    try {
      const { payload } = await jwtVerify(idToken, this.telegramJwks, {
        algorithms: ["RS256"],
        audience: config.clientId,
        clockTolerance: CLOCK_TOLERANCE_SECONDS,
        issuer: ISSUER,
      });

      this.validateRequiredClaims(payload, nonce);

      return {
        telegramId: payload.sub,
        ...this.readProfileClaims(payload),
      };
    } catch {
      throw new UnauthorizedException("Telegram authentication failed");
    }
  }

  private validateRequiredClaims(
    payload: JWTPayload,
    nonce: string,
  ): asserts payload is ValidTelegramPayload {
    const currentTime = Math.floor(Date.now() / 1000);

    if (
      typeof payload.sub !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.nonce !== nonce ||
      payload.iat > currentTime + CLOCK_TOLERANCE_SECONDS
    ) {
      throw new UnauthorizedException("Telegram authentication failed");
    }
  }

  private readProfileClaims(
    payload: JWTPayload,
  ): Omit<SessionUser, "telegramId"> {
    const numericId = payload.id;

    return {
      ...(typeof numericId === "number" && Number.isSafeInteger(numericId)
        ? { telegramNumericId: String(numericId) }
        : {}),
      ...this.optionalStringClaim("name", payload.name, 256),
      ...this.optionalStringClaim("username", payload.preferred_username, 64),
      ...this.optionalStringClaim("photoUrl", payload.picture, 1024),
    };
  }

  private optionalStringClaim(
    key: "name" | "photoUrl" | "username",
    value: unknown,
    maximumLength: number,
  ): Partial<Pick<SessionUser, "name" | "photoUrl" | "username">> {
    if (typeof value !== "string" || value.length > maximumLength) {
      return {};
    }

    return { [key]: value };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
}
