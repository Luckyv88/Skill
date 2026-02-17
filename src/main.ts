/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'; // default import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://skill-swap-o8x6.onrender.com', 'http://localhost:3000'], // allow both frontend and backend origins
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 4001);
  console.log(`Server running on port ${process.env.PORT ?? 4001}`);
}
bootstrap();
