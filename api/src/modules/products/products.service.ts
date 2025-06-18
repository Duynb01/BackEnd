import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        category: {
          select: {
            name: true
          }
        },
        productImages: {
          select: {
            url: true
          },
          take: 1,
        }
      },
    });
    return products.map((product)=>{
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category?.name || null,
        url: product.productImages[0]?.url || null
      }
    })
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        category: {
          select: {
            name: true
          }
        },
        productImages: {
          select: {
            url: true
          },
          take: 1,
        }
      }
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    const images = product.productImages || [];
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || null,
      url: images[0]?.url || null
    }
  }

  async update(id: string, data: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}
