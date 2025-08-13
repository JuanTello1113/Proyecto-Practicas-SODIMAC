import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies ? req.cookies['jwt'] : null),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_change_me',
    });
  }

  // Lo que retornes aquí es lo que verás en /auth/profile como "user"
  validate(payload: any) {
    return {
      id: payload.id,
      nombre: payload.nombre,
      correo: payload.correo,
      esAdmin: !!payload.esAdmin,
      esNomina: !!payload.esNomina,
      esJefe: !!payload.esJefe,
      roles: payload.roles ?? [],
      tiendaNombre: payload.tiendaNombre ?? null,
    };
  }
}