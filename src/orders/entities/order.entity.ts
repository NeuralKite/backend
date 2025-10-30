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

import { Customer } from '../../customers/entities/customer.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity({ name: 'orders' })
@Index(['customer'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Draft })
  status: OrderStatus;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    name: 'subtotal_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: '0.00',
  })
  subtotalAmount: string;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: '0.00',
  })
  taxAmount: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: '0.00',
  })
  totalAmount: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'confirmed_at', type: 'datetime', nullable: true })
  confirmedAt?: Date | null;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt?: Date | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items?: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory?: OrderStatusHistory[];
}
