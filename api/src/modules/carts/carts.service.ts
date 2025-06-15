import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: {userId},
      include: {product: true}
    });
  }

  async addToCart(userId: number, addToCartDto: AddCartDto){
    const findItem = await this.prisma.cartItem.findFirst({
      where: {userId, productId: addToCartDto.productId}
    })
    if(findItem){
      return this.prisma.cartItem.update({
        where: {id: findItem.id},
        data: {
          quantity: findItem.quantity + addToCartDto.quantity
        }
      })
    }
    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity
      }
    });
  }
  async updateQuantity(userId: number, cartItemId: number, updateCartDto: UpdateCartDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== BigInt(userId)) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: updateCartDto.quantity },
    });
  }

  async removeFromCart(userId: number, cartItemId: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== BigInt(userId)) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return this.prisma.cartItem.delete({ where: { id: cartItemId } });
  }
  async clearCart(userId: bigint) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }


}
