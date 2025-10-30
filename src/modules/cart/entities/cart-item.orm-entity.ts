import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../database/transformers/decimal.transformer';
import { CartOrmEntity } from './cart.orm-entity';

@Entity({ name: 'cart_items' })
@Index('idx_cart_items_cart_id', ['cartId'])
export class CartItemOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'cart_id', type: 'char', length: 36 })
  cartId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: new ColumnNumericTransformer() })
  price!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => CartOrmEntity, (cart: CartOrmEntity) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart!: CartOrmEntity;
}
