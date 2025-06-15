import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CartsModule } from './modules/carts/carts.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';

@Module({
  imports: [AuthModule, PrismaModule, ProductsModule, CartsModule, UsersModule, CategoriesModule, OrdersModule, ReviewsModule, VouchersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
