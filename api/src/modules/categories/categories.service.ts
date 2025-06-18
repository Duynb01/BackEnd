import { Injectable, NotFoundException } from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  findAll() {
    return this.prisma.category.findMany({
      select: {name: true},
      where: { active: true },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      select: {
        id: true,
        name: true
      },
      where: { id }
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy danh mục');

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
  }
}
