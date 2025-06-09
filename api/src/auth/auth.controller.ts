import { Controller, Post, Body, Res } from '@nestjs/common';
import {Response} from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });
    return res.json({
      message: result.message,
      access_token: result.access_token,
      token_type: 'Bearer',
      user: result.user,
    });
  }
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token'); // xóa cookie chứa JWT
    return { message: 'Đăng xuất thành công' };
  }
}
