// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategyBase, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase, 'jwt') {
  constructor() {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.jwt ?? null,       // cookie httpOnly 'jwt'
        ExtractJwt.fromAuthHeaderAsBearerToken(),           // opcional
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,        // <-- evitar string|undefined
    };

    super(opts);
  }

  // Lo que retornes aquí queda disponible en req.user
  async validate(payload: any) {
    return payload;
  }
}