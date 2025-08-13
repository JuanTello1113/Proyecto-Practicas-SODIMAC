// backend/src/auth/auth.service.ts
import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

export type SafeUser = {
  id: number;
  nombre: string;
  correo: string;
  esAdmin: boolean;
  esNomina: boolean;
  esJefe: boolean;
  roles: string[];
  tiendaNombre?: string | null;
};

export type LoginResult = { token: string; user: SafeUser };

/** Utils */
function pickStrings(obj: any, keys: string[]): string[] {
  const out: string[] = [];
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim() !== '') out.push(v);
  }
  return out;
}
function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** ⭐ Login general por correo: permite ADMIN, NOMINA, JEFE */
  async login(email: string): Promise<LoginResult> {
    if (!email || typeof email !== 'string') {
      throw new UnauthorizedException('Correo inválido');
    }
    const correo = email.trim().toLowerCase();

    // 1) usuario + roles
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        usuario_rol: { include: { rol: true } },
        // tienda: true, // si aplica en tu esquema
      },
    });
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    if (typeof (usuario as any).estado === 'boolean' && !(usuario as any).estado) {
      throw new ForbiddenException('Usuario inactivo');
    }

    // 2) extraer nombres e IDs de rol
    const ROLE_STRING_FIELDS = [
      'nombre', 'name', 'titulo', 'title',
      'rol', 'rolNombre', 'tipo', 'tipoRol',
      'userRoleTitle',
      'nombre_rol',                  // 👈 agregado: coincide con tu DB
    ];

    const roleNamesRaw: string[] = [];
    const roleIds: number[] = [];

    for (const ur of (usuario as any).usuario_rol ?? []) {
      const idRol = ur?.id_rol ?? ur?.rol_id ?? ur?.idRol ?? ur?.rolId;
      if (typeof idRol === 'number') roleIds.push(idRol);

      roleNamesRaw.push(...pickStrings(ur, ROLE_STRING_FIELDS));
      if (ur?.rol) roleNamesRaw.push(...pickStrings(ur.rol, ROLE_STRING_FIELDS));
    }

    const rolesRaw = uniq(roleNamesRaw.filter(Boolean));
    const rolesNorm = rolesRaw.map((r) => r.toLowerCase().trim());

    // 3) mapeo por nombre + fallback por IDs (de tus screenshots: 6/7/10)
    const ADMIN_ROLE_IDS  = (process.env.ADMIN_ROLE_IDS  ?? '6')
      .split(',').map((x) => Number(x.trim())).filter(Number.isFinite);
    const NOMINA_ROLE_IDS = (process.env.NOMINA_ROLE_IDS ?? '7')
      .split(',').map((x) => Number(x.trim())).filter(Number.isFinite);
    const JEFE_ROLE_IDS   = (process.env.JEFE_ROLE_IDS   ?? '10')
      .split(',').map((x) => Number(x.trim())).filter(Number.isFinite);

    const hasAnyId = (ids: number[]) => roleIds.some((id) => ids.includes(id));

    const esAdminByName =
      rolesNorm.includes('admin') ||
      rolesNorm.includes('administrador') ||
      rolesNorm.includes('administrator');
    const esNominaByName =
      rolesNorm.includes('nomina') ||
      rolesNorm.includes('nómina') ||
      rolesNorm.includes('payroll');
    const esJefeByName =
      rolesNorm.includes('jefe') ||
      rolesNorm.includes('manager') ||
      rolesNorm.includes('líder') ||
      rolesNorm.includes('lider');

    const esAdmin  = esAdminByName  || hasAnyId(ADMIN_ROLE_IDS);
    const esNomina = esNominaByName || hasAnyId(NOMINA_ROLE_IDS);
    const esJefe   = esJefeByName   || hasAnyId(JEFE_ROLE_IDS);

    // 4) armar usuario “seguro”
    const id =
      (usuario as any).id ??
      (usuario as any).id_usuario ??
      (usuario as any).usuario_id;
    const nombre =
      (usuario as any).nombre ??
      (usuario as any).nombres ??
      (usuario as any).name ??
      (usuario as any).fullName ??
      '';
    const tiendaNombre =
      (usuario as any)?.tienda?.nombre ??
      (usuario as any)?.tiendaNombre ??
      null;

    const user: SafeUser = {
      id: Number(id),
      nombre: String(nombre || ''),
      correo,
      esAdmin,
      esNomina,
      esJefe,
      roles: rolesRaw, // crudo para debug/UI; en el front igual lo normalizas
      tiendaNombre,
    };

    // 5) actualizar última actividad (opcional)
    await this.prisma.usuario.update({
      where: { correo },
      data: { ultima_actividad: new Date() },
    });

    // 6) firmar JWT
    const payload = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      esAdmin: user.esAdmin,
      esNomina: user.esNomina,
      esJefe: user.esJefe,
      roles: user.roles,
      tiendaNombre: user.tiendaNombre ?? null,
    };
    const token = await this.jwt.signAsync(payload);

    return { token, user };
  }

  /** 🟠 Solo-ADMIN (compatibilidad con tu ruta actual) */
  async adminLogin(email: string): Promise<LoginResult> {
    const { token, user } = await this.login(email);
    if (!user.esAdmin) {
      console.warn('[Auth] adminLogin: usuario sin rol ADMIN', {
        correo: user.correo,
        roles: user.roles,
      });
      throw new ForbiddenException('No tiene rol ADMIN');
    }
    return { token, user };
  }
}