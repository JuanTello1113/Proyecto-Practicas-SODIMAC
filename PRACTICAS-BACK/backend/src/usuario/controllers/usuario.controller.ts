// src/usuario/controllers/usuario.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service';

interface CrearUsuarioInput {
  nombre: string;
  correo: string;
  rol: string;
  tienda?: string;
}

interface EditarUsuario {
  nombre?: string;
  correo?: string;
  nuevoRolId?: number;
  idTienda?: number;
}

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Crear usuario
  @Post()
  crearUsuario(@Body() body: CrearUsuarioInput) {
    return this.usuarioService.crearUsuario(body);
  }

  // Listar
  @Get('listar')
  listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  // Obtener por id
  @Get(':id')
  findByID(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findById(id);
  }

  // Validar email
  @Get(':email/validar')
  validarEmail(@Param('email') email: string) {
    return this.usuarioService.validarEmail(email);
  }

  // Obtener roles/tiendas
  @Get()
  obtenerRolesYTiendas() {
    return this.usuarioService.obtenerRolesYTiendas();
  }

  // ===== Rutas antiguas (compatibilidad) =====
  @Put(':id/editar')
  editarUsuarioLegacy(@Param('id', ParseIntPipe) id: number, @Body() body: EditarUsuario) {
    return this.usuarioService.editarUsuario(id, body);
  }

  @Delete(':id/eliminar')
  eliminarUsuarioLegacy(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.eliminarUsuario(id);
  }

  @Patch(':id/desactivar')
  desactivarUsuarioLegacy(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.desactivarUsuario(id);
  }

  // ===== Rutas nuevas que usa el frontend =====
  @Patch(':id')
  editarUsuario(@Param('id', ParseIntPipe) id: number, @Body() body: EditarUsuario) {
    return this.usuarioService.editarUsuario(id, body);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activo: boolean },
  ) {
    return this.usuarioService.cambiarEstadoUsuario(id, body.activo);
  }

  @Delete(':id')
  eliminarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.eliminarUsuario(id);
  }
}
