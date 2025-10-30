import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderStatus } from '../enums/order-status.enum';
import { Order } from './order.entity';

@Entity({ name: 'order_status_history' })
export class OrderStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Order, (order) => order.statusHistory, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'old_status', type: 'enum', enum: OrderStatus, nullable: true })
  oldStatus?: OrderStatus | null;

  @Column({ name: 'new_status', type: 'enum', enum: OrderStatus })
  newStatus: OrderStatus;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;

  @Column({ name: 'changed_by', length: 120, nullable: true })
  changedBy?: string | null;
}
