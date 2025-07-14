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

  async getAll(status?: string){
    return this.prisma.payment.findMany({
      where: status ? {status} : {},
      orderBy: {createdAt: 'desc'},
      include: {order: true}
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



}
