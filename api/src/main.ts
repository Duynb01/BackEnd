import * as cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // domain frontend
    credentials: true,               // nếu cần gửi cookie
  });
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();