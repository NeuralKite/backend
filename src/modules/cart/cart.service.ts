import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { CartItemOrmEntity } from './entities/cart-item.orm-entity';
import { CartOrmEntity } from './entities/cart.orm-entity';

export interface CartSummary {
  currency: string;
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  discountCode?: string;
}

const DEFAULT_CART_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly cartRepository: Repository<CartOrmEntity>,
    @InjectRepository(CartItemOrmEntity)
    private readonly cartItemRepository: Repository<CartItemOrmEntity>,
  ) {}

  async addItem(payload: CreateCartItemDto): Promise<CartItem> {
    const cart = await this.ensureCart(payload.currency);

    const existingItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id },
      select: { currency: true },
    });

    if (existingItem?.currency && existingItem.currency !== payload.currency) {
      throw new BadRequestException('All cart items must share the same currency.');
    }

    if (!existingItem?.currency && cart.currency !== payload.currency) {
      cart.currency = payload.currency;
      await this.cartRepository.save(cart);
    }

    const entity = this.cartItemRepository.create({
      id: randomUUID(),
      cartId: cart.id,
      name: payload.name,
      price: payload.price,
      quantity: payload.quantity,
      currency: payload.currency,
    });

    await this.cartItemRepository.save(entity);

    return this.mapToDomain(entity);
  }

  async removeItem(id: string): Promise<void> {
    const cart = await this.ensureCart();
    const result = await this.cartItemRepository.delete({ id, cartId: cart.id });

    if (result.affected === 0) {
      throw new NotFoundException(`Item with id "${id}" was not found.`);
    }
  }

  async listItems(): Promise<CartItem[]> {
    const cart = await this.ensureCart();
    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
      order: { createdAt: 'ASC' },
    });

    return items.map((item) => this.mapToDomain(item));
  }

  async applyDiscount(discount: ApplyDiscountDto): Promise<CartSummary> {
    const cart = await this.ensureCart();

    cart.discountCode = discount.code;
    cart.discountPercentage = discount.percentage ?? null;

    await this.cartRepository.save(cart);

    return this.summary();
  }

  async summary(): Promise<CartSummary> {
    const cart = await this.ensureCart();
    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
      order: { createdAt: 'ASC' },
    });

    if (items.length === 0) {
      return {
        currency: cart.currency ?? 'USD',
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        discountCode: cart.discountCode ?? undefined,
      };
    }

    const subtotal = Number(
      items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2),
    );
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const discountAmount = this.calculateDiscount(subtotal, cart.discountPercentage ?? undefined);
    const total = Number((subtotal - discountAmount).toFixed(2));

    return {
      currency: cart.currency,
      totalItems: items.length,
      totalQuantity,
      subtotal,
      discountAmount,
      total,
      discountCode: cart.discountCode ?? undefined,
    };
  }

  private calculateDiscount(amount: number, percentage?: number): number {
    if (!percentage) {
      return 0;
    }

    if (amount <= 0) {
      return 0;
    }

    return Number(((amount * percentage) / 100).toFixed(2));
  }

  private async ensureCart(preferredCurrency?: string): Promise<CartOrmEntity> {
    let cart = await this.cartRepository.findOne({ where: { id: DEFAULT_CART_ID } });

    if (!cart) {
      cart = this.cartRepository.create({
        id: DEFAULT_CART_ID,
        currency: preferredCurrency ?? 'USD',
      });

      await this.cartRepository.save(cart);
    }

    return cart;
  }

  private mapToDomain(entity: CartItemOrmEntity): CartItem {
    return new CartItem({
      id: entity.id,
      name: entity.name,
      price: entity.price,
      quantity: entity.quantity,
      currency: entity.currency,
    });
  }
}
