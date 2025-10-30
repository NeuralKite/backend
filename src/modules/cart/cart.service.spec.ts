import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should add items and compute summary totals', () => {
    service.addItem({ name: 'Keyboard', price: 100, quantity: 1, currency: 'USD' });
    service.addItem({ name: 'Mouse', price: 50, quantity: 2, currency: 'USD' });

    const summary = service.summary();

    expect(summary.totalItems).toBe(2);
    expect(summary.totalQuantity).toBe(3);
    expect(summary.subtotal).toBe(200);
  });

  it('should apply percentage discount when provided', () => {
    service.addItem({ name: 'Keyboard', price: 100, quantity: 1, currency: 'USD' });

    const summary = service.applyDiscount({ code: 'SAVE10', percentage: 10 });

    expect(summary.discountAmount).toBe(10);
    expect(summary.total).toBe(90);
  });
});
