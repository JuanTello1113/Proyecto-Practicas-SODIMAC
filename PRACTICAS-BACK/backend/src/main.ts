// main.ts
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  // proxy (nginx/heroku/etc)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(cookieParser());

  const frontendOrigins: string[] = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== '') {
    frontendOrigins.push(process.env.FRONTEND_URL.trim());
  }

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (frontendOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Sistema Nomina')
    .setDescription('Documentación de Nomina')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('Nomina/docs', app, document);

  await app.listen(3000);
}
bootstrap().catch(console.error);
