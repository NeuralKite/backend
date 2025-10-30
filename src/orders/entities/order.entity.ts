import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderItem } from './order-item.entity'; // Asegúrate de importar la entidad OrderItem

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(
    () => OrderStatusHistory,
    (orderStatusHistory) => orderStatusHistory.order,
  )
  statusHistory: OrderStatusHistory[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[]; // Relación OneToMany con OrderItem

  // Otros campos y relaciones de Order
}
