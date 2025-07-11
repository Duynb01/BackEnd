import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CartsService } from '../carts/carts.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { PaymentsService } from '../payments/payments.service';
import { generateOrderCode } from '../../utils/generate-code';
import { ProductsService } from '../products/products.service';
import { OrderItem } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService,
              private readonly paymentService: PaymentsService,
              private readonly cartsService: CartsService,
              private readonly productsService: ProductsService,
              private readonly vouchersService: VouchersService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const code = generateOrderCode();
    const order = await this.prisma.order.create({
      data:{
        code,
        userId,
        status: 'PROCESSING',
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

    await this.handleUpdateData(userId, createOrderDto.items)
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

  private async handleUpdateData(userId: string, items: OrderItemDto[]){
    const cartItemIds = items
      .filter(item => item.cartItemId)
      .map(item => item.cartItemId);

    await Promise.all(
      cartItemIds.map((id: string) => this.cartsService.removeFromCart(userId, id))
    );

    await Promise.all(
      items.map(item => {
        const { productId, quantity } = item;
        if (productId && quantity) {
          return this.productsService.update(productId, {
            stock: String(quantity),
          });
        }
      })
    );
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
