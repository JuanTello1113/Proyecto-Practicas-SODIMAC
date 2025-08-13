// backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 🔵 Login general: ADMIN, NOMINA o JEFE */
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email?: string; correo?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = (body.correo ?? body.email ?? '').toString();
    const { token, user } = await this.authService.login(email);

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // en prod: true con HTTPS
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { message: 'ok', user };
  }

  /** 🟠 Solo-ADMIN (compatibilidad) */
  @Post('admin-login')
  @HttpCode(200)
  async adminLogin(
    @Body() body: { email: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.adminLogin(body.email);
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { message: 'ok', user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    return { message: 'ok' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() req: Request) {
    return { user: (req as any).user };
  }
}