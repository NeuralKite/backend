import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from './entities/category.entity';
import { Item } from './entities/item.entity';
import { TaxRate } from './entities/tax-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Item, TaxRate])],
  exports: [TypeOrmModule],
})
export class CatalogModule {}
