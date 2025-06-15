import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {id: true, email: true, name: true, role: true, createdAt: true}
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {id},
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })
    if(!user) throw new NotFoundException("Không tìm thấy người dùng")
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
