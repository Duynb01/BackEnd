import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CartsService } from '../carts/carts.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService,
              private readonly paymentService: PaymentsService,
              private readonly cartsService: CartsService,
              private readonly vouchersService: VouchersService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data:{
        userId,
        status: 'PENDING',
        total: createOrderDto.totalPrice,
        items: {
          create: createOrderDto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        },
      },
      include:{
        items: true,
      }
    })
    await this.cartsService.clearCart(userId)
    await this.paymentService.create({
      orderId: order.id,
      method: createOrderDto.method,
      amount: createOrderDto.totalPrice
    })
    return {
      message: 'Đặt hàng thành công',
      orderId: order.id
    };
  }

  async getByUser(userId: string){
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        Payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    }));
  }

  async findAll() {
    return this.prisma.order.findMany({
      include:{
        items:true,
        Payment: true
      },
      orderBy:{
        createdAt: 'desc'
      }
    });
  }

  async findOne(orderId: string){
    const order = await this.prisma.order.findUnique({
      where:{
        id: orderId,
      },
      include:{
        items: true,
        Payment: true
      }
    })
    if(!order) throw new NotFoundException(`Không tìm thấy đơn hàng`);
    return order;
  }

  async updateStatus(orderId: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: {id: orderId},
      data: { status: updateOrderDto.status }
    });
  }


}
