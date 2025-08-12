// src/auth/auth.controller.ts
import { Body, Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class AdminLoginDto {
  email!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login manual por correo (solo ADMIN registrado en DB)
  @Post('admin-login')
  async adminLogin(
    @Body() { email }: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // x-forwarded-for puede ser string|string[]|undefined
    const xff = req.headers['x-forwarded-for'] as string | string[] | undefined;
    const ip = (Array.isArray(xff) ? xff[0] : xff) ?? req.socket.remoteAddress ?? '';

    const { token, user } = await this.authService.adminLogin(email, ip);

    // Seteamos cookie httpOnly con el JWT
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      path: '/',
    });

    return { message: 'Inicio de sesión exitoso', user };
  }

  // Perfil (requiere JWT válido en cookie 'jwt' o Bearer)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return { user: (req as any).user };
  }

  // Logout: borra la cookie
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    return { message: 'Sesión cerrada correctamente' };
  }
}