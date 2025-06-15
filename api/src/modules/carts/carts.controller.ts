import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getMyCart(@Request() request) {
    return this.cartsService.findUserCart(request.user.id);
  }

  @Post('add')
  addToCart(@Body() createCartDto: AddCartDto, @Request() request) {
    return this.cartsService.addToCart(request.user.id, createCartDto);
  }

  @Patch(':id')
  updateQuantity(
    @Request() request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartsService.updateQuantity(request.user.id, id, dto);
  }

  @Delete(':id')
  removeFromCart(@Request() request, @Param('id', ParseIntPipe) id: number) {
    return this.cartsService.removeFromCart(request.user.id, id);
  }

  @Delete('clear')
  clearCart(@Request() request){
    return this.cartsService.clearCart(BigInt(request.user.id))
  }
}
