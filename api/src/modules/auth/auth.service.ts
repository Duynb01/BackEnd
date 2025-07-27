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

  async login(dto: LoginDto, deviceName:string, ipAddress:string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user || !user.password) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    if (!(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    if(!user.active) throw new ForbiddenException('Tài khoản của bạn đã bị vô hiệu hóa');

    const role = (user.role?.name || 'USER').toUpperCase()
    const {accessToken, refreshToken} = await this.handleToken(user.id, role, deviceName, ipAddress)
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role?.name || 'USER').toUpperCase(),
      },
    };
  }

  async googleLogin(token: string, deviceName: string, ipAddress:string){
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    const {email, name} = await googleRes.json();
    if(!email) throw new UnauthorizedException('Google token không hợp lệ')
    let user = await this.prisma.user.findUnique({
      where: {email},
      include: { role: true },
    })
    if(!user){
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: null,
          role: {
            connect: { id: 2 },
          },
        },
        include: {role: true},
      })
    }

    const role = (user.role?.name || 'USER').toUpperCase()
    const {accessToken, refreshToken} = await this.handleToken(user.id,role, deviceName, ipAddress)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role?.name || 'USER').toUpperCase(),
      },
    };
  }

  async reload(userId:string){
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
    return {
      status: 'success',
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role?.name || 'USER').toUpperCase(),
    };
  }

  async refresh(token: string, deviceName: string, ipAddress: string){
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: process.env.REFRESH_TOKEN_SECRET
    })
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {userId: decoded.sub, deviceName: deviceName, ipAddress: ipAddress}
    })

    if(!tokenRecord) throw new UnauthorizedException('Token không tồn tại!')
    const checked = await bcrypt.compare(token, tokenRecord.token);
    if (!checked) throw new ForbiddenException('Refresh token không hợp lệ.');
    if (tokenRecord.expiryDate <= new Date()) {
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new ForbiddenException('Refresh token đã hết hạn.');
    }
    const user = await this.prisma.user.findUnique({
      where:{id: decoded.sub},
      include:{role: true}
    })
   if (!user) throw new UnauthorizedException('User không tồn tại');
   const role:string = (user.role?.name || 'USER').toUpperCase()
   const {accessToken, refreshToken} = await this.handleToken(user.id, role, deviceName, ipAddress)
   return {
     access_token: accessToken,
     refresh_token: refreshToken,
   };
  }

  private async signRefreshToken(userId: string){
    return await this.jwtService.signAsync({ sub: userId },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d'
      })
  }
  private async signAccessToken(userId: string, role: string){
    return await this.jwtService.signAsync({ sub: userId, role: role },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m'
      })
  }
  private async handleToken(userId: string, role:string, deviceName: string, ipAddress:any){
    const accessToken = await this.signAccessToken(userId, role);
    const refreshToken = await this.signRefreshToken(userId)
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const checkRefreshToken = await this.prisma.refreshToken.findFirst({
      where: { userId, deviceName, ipAddress, } })
    if(checkRefreshToken){
      await this.prisma.refreshToken.update({
        where:{ id: checkRefreshToken.id },
        data:{
          token: hashedToken,
        }
      })
    }else{
      const decoded = this.jwtService.decode(refreshToken)
      const expiryDate = new Date(decoded.exp * 1000)
      await this.prisma.refreshToken.create({
        data: {
          token: hashedToken,
          expiryDate,
          deviceName,
          ipAddress,
          userId
        },
      });
    }
    return {
      accessToken,
      refreshToken
    }
  }
}
