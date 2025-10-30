import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

const DEFAULT_CURRENCY = 'USD';
const DISCOUNT_CATALOG: Record<string, number> = {
  SUMMER10: 10,
  WELCOME5: 5,
  VIP20: 20,
};

@Injectable()
export class CartService {
  private readonly items: CartItem[] = [];
  private currency: string | null = null;
  private discountCode?: string;
  private discountPercentage = 0;

  addItem(payload: CreateCartItemDto): CartItem {
    if (this.currency && payload.currency !== this.currency) {
      throw new BadRequestException('All items in the cart must use the same currency.');
    }

    if (!this.currency) {
      this.currency = payload.currency;
    }

    const item = new CartItem({
      id: randomUUID(),
      name: payload.name,
      price: Number(payload.price.toFixed(2)),
      quantity: payload.quantity,
      currency: payload.currency,
    });

    this.items.push(item);

    return item;
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  removeItem(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Item with id "${id}" was not found.`);
    }

    this.items.splice(index, 1);

    if (this.items.length === 0) {
      this.currency = null;
      this.discountCode = undefined;
      this.discountPercentage = 0;
    }
  }

  applyDiscount(payload: ApplyDiscountDto): CartSummary {
    if (this.items.length === 0) {
      throw new BadRequestException('Cannot apply a discount to an empty cart.');
    }

    const discountPercentage = this.resolveDiscountPercentage(payload.code, payload.percentage);

    if (discountPercentage <= 0 || discountPercentage > 100) {
      throw new BadRequestException('Discount percentage must be between 0 and 100.');
    }

    this.discountCode = payload.code;
    this.discountPercentage = discountPercentage;

    return this.summary();
  }

  summary(): CartSummary {
    const subtotal = Number(
      this.items
        .reduce((accumulator, item) => accumulator + item.price * item.quantity, 0)
        .toFixed(2),
    );
    const totalQuantity = this.items.reduce((accumulator, item) => accumulator + item.quantity, 0);
    const discountAmount = Number(
      Math.min(subtotal, (subtotal * this.discountPercentage) / 100).toFixed(2),
    );
    const total = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

    return {
      currency: this.currency ?? DEFAULT_CURRENCY,
      totalItems: this.items.length,
      totalQuantity,
      subtotal,
      discountAmount,
      total,
      discountCode: this.discountCode,
    };
  }

  private resolveDiscountPercentage(code: string, provided?: number): number {
    if (typeof provided === 'number') {
      return provided;
    }

    const lookup = DISCOUNT_CATALOG[code.toUpperCase()];

    if (lookup === undefined) {
      throw new BadRequestException(`Unknown discount code "${code}".`);
    }

    return lookup;
  }
}
