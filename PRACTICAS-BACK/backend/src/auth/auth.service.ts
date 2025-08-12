import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

type JwtPayload = {
  id_usuario: number;
  correo: string;
  nombre: string;
  rol: string;
  esAdmin: boolean;
  esNomina: boolean;
  esJefe: boolean;
  panelTitle: string;
  userRoleTitle: string;
  nombreTienda?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Login manual para ADMIN por correo corporativo
   */
  async adminLogin(email: string, ip?: string) {
  // 1) Normaliza el correo recibido
  const cleanEmail = (email ?? '').trim().toLowerCase();
  console.log('[Auth] intento adminLogin', { emailIn: email, cleanEmail });

  // 2) Busca insensible a mayúsculas/minúsculas y con estado=true
  const user = await this.prisma.usuario.findFirst({
    where: {
      correo: { equals: cleanEmail, mode: 'insensitive' },
      estado: true,
    },
    include: {
      usuario_rol: { include: { rol: true } },
      usuario_tienda: { include: { tienda: true } },
    },
  });

  if (!user) {
    await this.safeLog(
      'LOGIN_ADMIN_FAIL',
      `Usuario no encontrado | correo=${cleanEmail} | ip=${ip ?? 'desconocida'}`,
    );
    throw new UnauthorizedException('Usuario no autorizado.');
  }

  // 3) Normaliza roles (lowercase + trim)
  const rolesNorm = (user.usuario_rol ?? [])
    .map((ur: any) => (ur.rol?.nombre_rol ?? '').toString().toLowerCase().trim())
    .filter(Boolean);

  const esAdmin = rolesNorm.includes('admin');

  // Log de diagnóstico
  console.log('[Auth] roles encontrados', {
    raw: (user.usuario_rol ?? []).map((ur: any) => ur.rol?.nombre_rol),
    norm: rolesNorm,
    esAdmin,
  });

  if (!esAdmin) {
    await this.safeLog(
      'LOGIN_ADMIN_DENY',
      `Usuario sin rol ADMIN | correo=${user.correo} | roles=${rolesNorm.join(',')} | ip=${ip ?? 'desconocida'}`,
    );
    throw new ForbiddenException('Acceso restringido a usuarios con rol ADMIN.');
  }

  // 4) Construye el payload con datos normalizados
  const payload = this.buildPayloadFromUser(user);

  // 5) Firma el JWT con vars .env
  const token = await this.jwt.signAsync(payload, {
    secret: (process.env.JWT_SECRET as string) ?? 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  });

  // 6) Log informativo (usa solo campos del modelo correo_log)
  await this.safeLog(
    'LOGIN_ADMIN',
    `Login ADMIN manual | correo=${user.correo} | ip=${ip ?? 'desconocida'}`,
  );

  return { token, user: payload };
}

  /**
   * Devuelve el perfil normalizado desde DB
   */
  async getProfile(id_usuario: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      include: {
        usuario_rol: { include: { rol: true } },
        usuario_tienda: { include: { tienda: true } },
      },
    });
    if (!user) return null;
    return this.buildPayloadFromUser(user);
  }

  /**
   * Construye el payload a partir del usuario de BD
   */
  private buildPayloadFromUser(user: any): JwtPayload {
    const nombreTienda =
      user?.usuario_tienda &&
      Array.isArray(user.usuario_tienda) &&
      user.usuario_tienda.length > 0 &&
      user.usuario_tienda[0]?.tienda
        ? user.usuario_tienda[0].tienda.nombre
        : undefined;

    const rolesNorm = (user.usuario_rol ?? [])
      .map((ur: any) => ur.rol?.nombre_rol?.toLowerCase?.() ?? '')
      .filter(Boolean);

    const esAdmin = rolesNorm.includes('admin');
    const esNomina = rolesNorm.includes('nomina');
    const esJefe =
      rolesNorm.includes('jefe') ||
      rolesNorm.includes('jefe_tienda') ||
      rolesNorm.includes('jefe tienda');

    const rolPrincipal = esAdmin
      ? 'ADMIN'
      : rolesNorm[0]
      ? rolesNorm[0].toUpperCase()
      : 'USUARIO';

    const panelTitle = esAdmin
      ? 'Administrador'
      : esNomina
      ? 'Nómina'
      : esJefe
      ? 'Jefe'
      : 'Usuario';

    return {
      id_usuario: user.id_usuario,
      correo: user.correo,
      nombre: user.nombre,
      rol: rolPrincipal,
      esAdmin,
      esNomina,
      esJefe,
      panelTitle,
      userRoleTitle: panelTitle,
      nombreTienda,
    };
  }

  /**
   * Crea un registro en correo_log usando el modelo real
   * estado_envio: varchar(50)
   * mensaje_error: string libre
   */
  private async safeLog(estado_envio: string, mensaje: string) {
    try {
      await this.prisma.correo_log.create({
        data: {
          estado_envio: estado_envio.slice(0, 50),
          mensaje_error: mensaje,
          // fecha_envio se asigna por @default(now())
          // id_notificacion se deja nulo si no aplica
        },
      });
    } catch {
      // No romper el flujo si el log falla
    }
  }
}