import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // domain frontend
    credentials: true,               // nếu cần gửi cookie
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();