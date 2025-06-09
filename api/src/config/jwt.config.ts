import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'default_jwt_secret',
  signOptions: { expiresIn: '1d' },
});