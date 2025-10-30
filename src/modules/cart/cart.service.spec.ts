import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

const createItemPayload = (overrides: Partial<CreateCartItemDto> = {}): CreateCartItemDto => ({
  name: 'Wireless mouse',
  price: 49.99,
  quantity: 1,
  currency: 'USD',
  ...overrides,
}) as CreateCartItemDto;

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addItem', () => {
    it('stores a new item and returns it with an identifier', () => {
      const item = service.addItem(createItemPayload());

      expect(item.id).toBeDefined();
      expect(item.toJSON()).toMatchObject({
        name: 'Wireless mouse',
        price: 49.99,
        quantity: 1,
        currency: 'USD',
      });
    });

    it('enforces a consistent currency across items', () => {
      service.addItem(createItemPayload({ currency: 'USD' }));

      expect(() => service.addItem(createItemPayload({ currency: 'EUR' }))).toThrow(BadRequestException);
    });
  });

  describe('getItems', () => {
    it('returns the items currently stored in the cart', () => {
      const first = service.addItem(createItemPayload({ name: 'Mechanical keyboard', price: 120 }));
      const second = service.addItem(createItemPayload({ name: 'USB hub', price: 40, quantity: 2 }));

      const items = service.getItems();

      expect(items).toHaveLength(2);
      expect(items[0]).toEqual(first);
      expect(items[1]).toEqual(second);
    });
  });

  describe('removeItem', () => {
    it('removes an item by identifier', () => {
      const item = service.addItem(createItemPayload());

      service.removeItem(item.id);

      expect(service.getItems()).toHaveLength(0);
    });

    it('throws when attempting to remove a non-existing item', () => {
      expect(() => service.removeItem('missing-id')).toThrow(NotFoundException);
    });
  });

  describe('summary', () => {
    it('aggregates totals for the current cart state', () => {
      service.addItem(createItemPayload({ name: 'Mechanical keyboard', price: 120 }));
      service.addItem(createItemPayload({ name: 'Laptop stand', price: 40, quantity: 2 }));

      const summary = service.summary();

      expect(summary.totalItems).toBe(2);
      expect(summary.totalQuantity).toBe(3);
      expect(summary.subtotal).toBe(200);
      expect(summary.discountAmount).toBe(0);
      expect(summary.total).toBe(200);
    });

    it('returns zeroed totals for an empty cart', () => {
      const summary = service.summary();

      expect(summary).toMatchObject({
        currency: 'USD',
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
      });
    });
  });

  describe('applyDiscount', () => {
    it('applies a provided percentage to the cart subtotal', () => {
      service.addItem(createItemPayload({ price: 100 }));

      const summary = service.applyDiscount({ code: 'SUMMER10', percentage: 10 });

      expect(summary.discountAmount).toBe(10);
      expect(summary.total).toBe(90);
      expect(summary.discountCode).toBe('SUMMER10');
    });

    it('throws when attempting to discount an empty cart', () => {
      expect(() => service.applyDiscount({ code: 'SUMMER10', percentage: 10 })).toThrow(
        BadRequestException,
      );
    });

    it('rejects unknown discount codes when no percentage is provided', () => {
      service.addItem(createItemPayload());

      expect(() => service.applyDiscount({ code: 'UNKNOWN' })).toThrow(BadRequestException);
    });
  });
});
