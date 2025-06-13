import { Injectable, UnauthorizedException } from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import * as process from 'node:process';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'supertest';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['access_token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey'
    });
  }
  async validate(payload){
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng.');
    }
    return user;
  }
}