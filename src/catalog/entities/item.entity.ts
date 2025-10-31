import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderItem } from '../../orders/entities/order-item.entity';
import { ItemType } from '../enums/item-type.enum';
import { Category } from './category.entity';
import { TaxRate } from './tax-rate.entity';

@Entity({ name: 'items' })
@Index(['category'])
@Index(['isActive'])
export class Item {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Category, (category) => category.items, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 180 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl?: string | null;

  @Column({ length: 64, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'enum', enum: ItemType, default: ItemType.Product })
  type: ItemType;

  @ManyToOne(() => TaxRate, (taxRate) => taxRate.items, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tax_rate_id' })
  taxRate?: TaxRate | null;

  @Column({ name: 'stock_quantity', type: 'int', unsigned: true, default: 0 })
  stockQuantity: number;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.item)
  orderItems?: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
