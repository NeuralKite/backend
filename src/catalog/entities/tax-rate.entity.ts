import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Item } from './item.entity';

@Entity({ name: 'tax_rates' })
export class TaxRate {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: string;

  @Column({ name: 'is_default', type: 'tinyint', width: 1, default: 0 })
  isDefault: boolean;

  @OneToMany(() => Item, (item) => item.taxRate)
  items?: Item[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
