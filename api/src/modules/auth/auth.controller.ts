import { Controller, Post, Body, Res, Get, UseGuards, Request } from '@nestjs/common';
import {Response} from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({passthrough: true}) res: Response) {
    const result = await this.authService.login(dto)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 ngày: 24 * 60 * 60 * 1000
    });
    return res.json({
      status: 'success',
      message: 'Đăng nhập thành công',
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
    return {
      status:'success',
      message: 'Đăng xuất thành công' };
  }
  @Get('reload')
  @UseGuards(JwtAuthGuard)
  checkLogin(@Request() request ){
    return {
      status:'success',
      name: request.user.name,
      email: request.user.email};
  }
}
