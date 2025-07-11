import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { generatePaymentCode } from '../../utils/generate-code';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where:{
        id: createPaymentDto.orderId
      }
    })
    const code = generatePaymentCode();
    if(!order) throw new NotFoundException('Không tìm thấy đơn hàng')
    return this.prisma.payment.create({
      data: {
        code,
        orderId: createPaymentDto.orderId,
        method: createPaymentDto.method,
        amount: createPaymentDto.amount,
        status: createPaymentDto.method === 'cod' ? 'SUCCESS' : 'PENDING',
        transactionId: null,
        paymentTime: createPaymentDto.method === 'cod' ? new Date() : null,
      }
    })
  }

  async updateStatus(orderId: string, status: string, transactionId?: string){
    const payment = await this.prisma.payment.findUnique({
      where: {orderId}
    })
    if (!payment) throw new NotFoundException('Không tìm thấy thanh toán');
    return this.prisma.payment.update({
      where: {orderId},
      data: {
        status,
        transactionId,
        paymentTime: new Date()
      }
    })
  }

  async getByOrderId(orderId:string){
    return this.prisma.payment.findUnique({
      where: {orderId}
    })
  }

  async getAll(status?: string){
    return this.prisma.payment.findMany({
      where: status ? {status} : {},
      orderBy: {createdAt: 'desc'},
      include: {order: true}
    })
  }

  async getByUser(userId: string, status?: string){
    return this.prisma.payment.findMany({
      where: {
        order: { userId },
        ...(status ? { status } : {}),
      },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }


  // findAll() {
  //   return `This action returns all payments`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} payment`;
  // }
  //
  // update(id: number, updatePaymentDto: UpdatePaymentDto) {
  //   return `This action updates a #${id} payment`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} payment`;
  // }
}
