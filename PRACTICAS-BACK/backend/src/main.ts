// main.ts
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Desactiva CORS aquí; abajo lo configuramos manualmente
  const app = await NestFactory.create(AppModule, { cors: false });

  // Si corres detrás de un proxy (Nginx, etc.)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Cookies httpOnly
  app.use(cookieParser());

  // Orígenes permitidos para el front (Vite)
  const frontendOrigins: string[] = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== '') {
    frontendOrigins.push(process.env.FRONTEND_URL.trim());
  }

  // CORS para credentials (cookies) y pruebas locales (origin null permitido)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger
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