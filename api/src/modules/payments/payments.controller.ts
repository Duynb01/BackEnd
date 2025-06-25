import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findAll(@Query('status') status?:string) {
    return this.paymentsService.getAll(status);
  }

  @Get(':orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getByOrderId(orderId);
  }

  @Get('user/:userId')
  getUserPayments(
    @Param('userId') userId: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.getByUser(userId, status);
  }

  @Patch(':orderId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.updateStatus(orderId, updatePaymentDto.status, updatePaymentDto.transactionId);
  }
}
