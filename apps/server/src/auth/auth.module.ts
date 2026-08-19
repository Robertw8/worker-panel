import { Module } from "@nestjs/common";
import { AuthConfigService } from "./auth-config.service";
import { AuthSessionService } from "./auth-session.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TelegramOidcService } from "./telegram-oidc.service";

@Module({
  controllers: [AuthController],
  providers: [
    AuthConfigService,
    AuthSessionService,
    AuthService,
    TelegramOidcService,
  ],
})
export class AuthModule {}
