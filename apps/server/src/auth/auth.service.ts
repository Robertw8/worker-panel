import { Injectable, UnauthorizedException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import { AuthSessionService } from "./auth-session.service";
import { TelegramOidcService } from "./telegram-oidc.service";
import type { SessionUser } from "./auth.types";

export interface TelegramLoginStart {
  authorizationUrl: string;
  transactionToken: string;
}

export interface TelegramLoginResult {
  sessionToken: string;
  user: SessionUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly telegramOidcService: TelegramOidcService,
  ) {}

  getHealth(): { status: "ok" } {
    return { status: "ok" };
  }

  async startTelegramLogin(): Promise<TelegramLoginStart> {
    const request = this.telegramOidcService.createAuthorizationRequest();
    const transactionToken =
      await this.authSessionService.createTransactionToken(request.transaction);

    return {
      authorizationUrl: request.authorizationUrl,
      transactionToken,
    };
  }

  async completeTelegramLogin(
    code: string,
    state: string,
    transactionToken: string,
  ): Promise<TelegramLoginResult> {
    const transaction =
      await this.authSessionService.verifyTransactionToken(transactionToken);

    if (!this.securelyEqual(state, transaction.state)) {
      throw new UnauthorizedException("Telegram authentication failed");
    }

    const { idToken } = await this.telegramOidcService.exchangeCode(
      code,
      transaction.codeVerifier,
    );
    const user = await this.telegramOidcService.verifyIdToken(
      idToken,
      transaction.nonce,
    );
    const sessionToken =
      await this.authSessionService.createSessionToken(user);

    return { sessionToken, user };
  }

  async getCurrentUser(sessionToken: string): Promise<SessionUser> {
    return this.authSessionService.verifySessionToken(sessionToken);
  }

  private securelyEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }
}
