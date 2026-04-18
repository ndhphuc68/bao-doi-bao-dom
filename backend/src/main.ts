import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const corsOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3002',
        'http://127.0.0.1:3002',
      ];

  /** Dev: Quick Tunnel / origin đổi (*.trycloudflare.com) — chỉ bật khi compose.quicktunnel bật CORS_REFLECT_REQUEST_ORIGIN */
  const reflectCors = process.env.CORS_REFLECT_REQUEST_ORIGIN === 'true';

  app.enableCors({
    origin: reflectCors ? true : corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
