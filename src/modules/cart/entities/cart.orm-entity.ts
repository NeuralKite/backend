import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItemOrmEntity } from './cart-item.orm-entity';

@Entity({ name: 'carts' })
export class CartOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'discount_code', type: 'varchar', length: 64, nullable: true })
  discountCode?: string | null;

  @Column({
    name: 'discount_percentage',
    type: 'int',
    nullable: true,
  })
  discountPercentage?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => CartItemOrmEntity, (item: CartItemOrmEntity) => item.cart, { cascade: ['insert', 'update'] })
  items!: CartItemOrmEntity[];
}
