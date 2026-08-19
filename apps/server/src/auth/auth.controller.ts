import type { ApiResponse, AuthUser } from "@inferno/shared";
import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthConfigService } from "./auth-config.service";
import { AuthSessionService } from "./auth-session.service";
import { AuthService } from "./auth.service";
import type { TelegramCallbackQuery } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authConfig: AuthConfigService,
    private readonly authSessionService: AuthSessionService,
    private readonly authService: AuthService,
  ) {}

  @Get("health")
  getHealth(): { status: "ok" } {
    return this.authService.getHealth();
  }

  @Get("telegram/start")
  async startTelegramLogin(@Res() response: Response): Promise<void> {
    this.authConfig.getClientLoginUrl();
    const result = await this.authService.startTelegramLogin();

    this.authSessionService.setTransactionCookie(
      response,
      result.transactionToken,
    );
    response.redirect(result.authorizationUrl);
  }

  @Get("telegram/callback")
  async completeTelegramLogin(
    @Query() query: TelegramCallbackQuery,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const errorRedirectUrl = this.authConfig.getClientLoginUrl("error");
    const successRedirectUrl = this.authConfig.getClientLoginUrl("success");

    try {
      const transactionToken =
        this.authSessionService.getTransactionCookie(request);

      if (
        query.error ||
        !this.isNonEmptyString(query.code) ||
        !this.isNonEmptyString(query.state) ||
        !transactionToken
      ) {
        this.authSessionService.clearTransactionCookie(response);
        response.redirect(errorRedirectUrl);
        return;
      }

      const result = await this.authService.completeTelegramLogin(
        query.code,
        query.state,
        transactionToken,
      );

      this.authSessionService.setSessionCookie(response, result.sessionToken);
      this.authSessionService.clearTransactionCookie(response);
      response.redirect(successRedirectUrl);
    } catch (error: unknown) {
      this.authSessionService.clearTransactionCookie(response);

      if (error instanceof HttpException) {
        response.redirect(errorRedirectUrl);
        return;
      }

      throw error;
    }
  }

  @Get("me")
  async getCurrentUser(
    @Req() request: Request,
  ): Promise<ApiResponse<AuthUser>> {
    const sessionToken = this.authSessionService.getSessionCookie(request);

    if (!sessionToken) {
      throw new UnauthorizedException("Authentication required");
    }

    return {
      data: await this.authService.getCurrentUser(sessionToken),
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    this.authSessionService.clearSessionCookie(response);
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0;
  }
}
