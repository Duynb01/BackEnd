import { Controller, Get, Post, Body, Patch, Param, Request, Delete, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import * as timers from 'node:timers';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyVouchers(@Request() request){
    return this.vouchersService.findByUser(request.user.id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  create(@Request() request, @Body() dto: CreateVoucherDto){
    return this.vouchersService.create(request.user.id, dto)
  }

  @Post('claim/:voucherId')
  @UseGuards(JwtAuthGuard)
  claimVoucher(@Request() request, @Param('voucherId') voucherId: string){
    return this.vouchersService.claimVoucher(request.user.id, voucherId)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  remove(@Param('id') id: string){
    return this.vouchersService.remove(id)
  }
}
