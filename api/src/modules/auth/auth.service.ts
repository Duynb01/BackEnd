import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: {
          connect: { id: 2 },
        },
      },
      include: {role: true},
    });

    return {
      message: 'Đăng ký thành công!',
      user: {
        email: user.email,
        name: user.name,
        role: user.role?.name || 'USER',
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      },
      include: {
        role: true,
      },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }
    if(!user.active) throw new ForbiddenException('Tài khoản của bạn đã bị vô hiệu hóa');

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: (user.role?.name || 'USER').toUpperCase(),
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
  }

  async checkLogin(userId:string){
    const user = await this.prisma.user.findUnique({
      where:{id: userId},
      include: {role: true}
    })
    if (!user) {
      throw new ForbiddenException('Không tìm thấy người dùng.');
    }

    if (!user.active) {
      throw new ForbiddenException('Vui lòng đăng nhập lại');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: (user.role?.name || 'USER').toUpperCase(),
    };

    return {
      status: 'success',
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };
  }
}
