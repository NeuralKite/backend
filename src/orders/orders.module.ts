import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory])],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
