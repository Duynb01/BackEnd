import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {id: true, email: true, name: true, role: true, createdAt: true}
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {id},
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: {
          select:{
            name: true
          }
        }
      }
    })
    if(!user) throw new NotFoundException("Không tìm thấy người dùng")
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role.name,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {id},
    });
    if(!user) throw new NotFoundException("Người dùng không tồn tại");

    const isCheck = await bcrypt.compare(updatePasswordDto.oldPassword, user.password)
    if(!isCheck) throw new BadRequestException("Mật khẩu hiện tại không đúng")

    const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: {id},
      data: {password: hashedNewPassword}
    })

    return {message: "Đổi mật khẩu thành công"};
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
