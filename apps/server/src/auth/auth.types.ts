import type { AuthUser } from "@inferno/shared";

export interface TelegramOidcConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TelegramOidcTransaction {
  state: string;
  codeVerifier: string;
  nonce: string;
}

export interface TelegramAuthorizationRequest {
  authorizationUrl: string;
  transaction: TelegramOidcTransaction;
}

export interface TelegramTokenResponse {
  idToken: string;
}

export interface TelegramCallbackQuery {
  code?: string;
  error?: string;
  state?: string;
}

export type SessionUser = AuthUser;
