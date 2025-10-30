import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItemOrmEntity } from './entities/cart-item.orm-entity';
import { CartOrmEntity } from './entities/cart.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartOrmEntity, CartItemOrmEntity])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
