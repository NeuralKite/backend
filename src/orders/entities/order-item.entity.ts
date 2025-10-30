import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Item } from '../../catalog/entities/item.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_items' })
@Unique(['order', 'item'])
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Item, (item) => item.orderItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, default: '0.00' })
  taxPercentage: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  taxAmount: string;

  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  subtotalAmount: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  totalAmount: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
