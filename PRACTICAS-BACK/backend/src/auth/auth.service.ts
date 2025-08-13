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

/**
 * Utilidades para extraer roles de estructuras cambiantes
 */
function pickStrings(obj: any, keys: string[]): string[] {
  const out: string[] = [];
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim() !== '') out.push(v);
  }
  return out;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Login por correo corporativo para ADMIN.
   * - Normaliza correo
   * - Busca usuario + roles
   * - Verifica activo + rol ADMIN (por nombre O por id)
   * - Firma JWT y devuelve { token, user }
   */
  async adminLogin(email: string): Promise<LoginResult> {
    if (!email || typeof email !== 'string') {
      throw new UnauthorizedException('Correo inválido');
    }
    const correo = email.trim().toLowerCase();

    // === 1) Traer usuario con roles ===
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        usuario_rol: {
          include: {
            rol: true, // relación rol
          },
        },
        // tienda: true, // descomenta si tienes relación tienda
      },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    // Si manejas estado/activo
    if (typeof (usuario as any).estado === 'boolean' && !(usuario as any).estado) {
      throw new ForbiddenException('Usuario inactivo');
    }

    // === 2) Extraer strings de rol y también IDs ===
    const ROLE_STRING_FIELDS = [
      'nombre',
      'name',
      'titulo',
      'title',
      'rol',
      'rolNombre',
      'tipo',
      'tipoRol',
      'userRoleTitle', // <- he visto que te sale así en la respuesta
    ];

    const roleNamesRaw: string[] = [];
    const roleIds: number[] = [];

    for (const ur of (usuario as any).usuario_rol ?? []) {
      // Posibles IDs en la intermedia
      const idRol = ur?.id_rol ?? ur?.rol_id ?? ur?.idRol ?? ur?.rolId;
      if (typeof idRol === 'number') roleIds.push(idRol);

      // Strings posibles en la intermedia
      roleNamesRaw.push(...pickStrings(ur, ROLE_STRING_FIELDS));

      // Strings del objeto rol relacionado
      if (ur?.rol) roleNamesRaw.push(...pickStrings(ur.rol, ROLE_STRING_FIELDS));
    }

    const rolesRaw = uniq(roleNamesRaw.filter(Boolean));
    const rolesNorm = rolesRaw.map((r) => r.toLowerCase().trim());

    // === 3) Fallback por IDs de rol ===
    // Puedes configurar por env, por ejemplo ADMIN_ROLE_IDS="6,1"
    const ADMIN_ROLE_IDS = (process.env.ADMIN_ROLE_IDS ?? '6')
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n));

    const esAdminByName =
      rolesNorm.includes('admin') ||
      rolesNorm.includes('administrador') ||
      rolesNorm.includes('administrator');

    const esAdminById = roleIds.some((id) => ADMIN_ROLE_IDS.includes(id));

    const esAdmin = esAdminByName || esAdminById;

    const esNomina =
      rolesNorm.includes('nomina') ||
      rolesNorm.includes('nómina') ||
      rolesNorm.includes('payroll');

    const esJefe =
      rolesNorm.includes('jefe') ||
      rolesNorm.includes('manager') ||
      rolesNorm.includes('líder') ||
      rolesNorm.includes('lider');

    if (!esAdmin) {
      // Deja este log mientras pruebas (luego puedes quitarlo)
      console.warn('[Auth] Rol ADMIN no detectado', {
        correo,
        roleIds,
        ADMIN_ROLE_IDS,
        rolesRaw,
        rolesNorm,
      });
      throw new ForbiddenException('No tiene rol ADMIN');
    }

    // === 4) Armar usuario seguro ===
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
      roles: rolesRaw,
      tiendaNombre,
    };

    // === 5) JWT con flags ===
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
}