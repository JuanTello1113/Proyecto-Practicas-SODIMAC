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
import { Response, Request } from 'express';          // ⬅️ TIPOS DE EXPRESS
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';      // ⬅️ IMPORTA EL GUARD

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin-login')
  @HttpCode(200)
  async adminLogin(
    @Body() body: { email: string },
    @Res({ passthrough: true }) res: Response,        // ⬅️ Response tipado
  ) {
    const { token, user } = await this.authService.adminLogin(body.email);

    // Cookie host-only para DEV (sin domain, sin secure)
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,         // en prod: true con HTTPS
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { message: 'ok', user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) { // ⬅️ Response tipado
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,         // en prod: true
      path: '/',
    });
    return { message: 'ok' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() req: Request) {                      // ⬅️ Request tipado
    return { user: (req as any).user };
  }
}