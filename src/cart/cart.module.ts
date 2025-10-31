import { Module } from '@nestjs/common';

import { CatalogModule } from '../catalog/catalog.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [CatalogModule, CustomersModule, OrdersModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
