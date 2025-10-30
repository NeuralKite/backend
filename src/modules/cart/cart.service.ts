import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';

export interface CartSummary {
  currency: string;
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  discountCode?: string;
}

@Injectable()
export class CartService {
  private readonly items = new Map<string, CartItem>();
  private activeDiscount?: ApplyDiscountDto;

  addItem(payload: CreateCartItemDto): CartItem {
    const [, firstItem] = this.items.entries().next().value ?? [];
    if (firstItem && firstItem.currency !== payload.currency) {
      throw new BadRequestException('All cart items must share the same currency.');
    }

    const id = randomUUID();
    const item = new CartItem({
      id,
      ...payload,
    });

    this.items.set(id, item);
    return item;
  }

  removeItem(id: string): void {
    if (!this.items.delete(id)) {
      throw new NotFoundException(`Item with id "${id}" was not found.`);
    }
  }

  listItems(): CartItem[] {
    return Array.from(this.items.values()).map((item) => new CartItem(item.toJSON()));
  }

  applyDiscount(discount: ApplyDiscountDto): CartSummary {
    this.activeDiscount = discount;
    return this.summary();
  }

  summary(): CartSummary {
    const items = this.listItems();

    if (items.length === 0) {
      return {
        currency: 'USD',
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
      };
    }

    const currency = items[0].currency;
    const subtotal = Number(
      items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2),
    );
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const discountAmount = this.calculateDiscount(subtotal);
    const total = Number((subtotal - discountAmount).toFixed(2));

    return {
      currency,
      totalItems: items.length,
      totalQuantity,
      subtotal,
      discountAmount,
      total,
      discountCode: this.activeDiscount?.code,
    };
  }

  private calculateDiscount(amount: number): number {
    if (!this.activeDiscount?.percentage) {
      return 0;
    }

    return Number(((amount * this.activeDiscount.percentage) / 100).toFixed(2));
  }
}
