// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    // Passport con estrategia por defecto 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),

    // JWT firmado con variables de entorno
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,     // registra la estrategia 'jwt'
    JwtAuthGuard,    // guard que protege endpoints
    PrismaService,   // acceso a la BD
  ],
  // Exporta para que otros módulos puedan usar JwtService/JwtAuthGuard
  exports: [JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}