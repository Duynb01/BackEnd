import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')

export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() request, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(request.user.id, createReviewDto);
  }

  @Get('product/:productId')
  findAll(@Param('productId') productId: string) {
    return this.reviewsService.findAll(productId);
  }
}
