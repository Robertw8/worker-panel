import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const clientUrl =
    configService.get<string>('CLIENT_URL')?.trim() ||
    'http://localhost:5173';
  const port = Number(process.env.PORT ?? 3000);

  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: clientUrl,
  });

  await app.listen(port);
}

void bootstrap();
