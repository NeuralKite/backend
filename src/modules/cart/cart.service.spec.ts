import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartItemOrmEntity } from './entities/cart-item.orm-entity';
import { CartOrmEntity } from './entities/cart.orm-entity';

describe('CartService', () => {
  let moduleRef: TestingModule;
  let service: CartService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          dropSchema: true,
          synchronize: true,
          entities: [CartOrmEntity, CartItemOrmEntity],
        }),
        TypeOrmModule.forFeature([CartOrmEntity, CartItemOrmEntity]),
      ],
      providers: [CartService],
    }).compile();

    service = moduleRef.get<CartService>(CartService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should add items and compute summary totals', async () => {
    await service.addItem({ name: 'Keyboard', price: 100, quantity: 1, currency: 'USD' });
    await service.addItem({ name: 'Mouse', price: 50, quantity: 2, currency: 'USD' });

    const summary = await service.summary();

    expect(summary.totalItems).toBe(2);
    expect(summary.totalQuantity).toBe(3);
    expect(summary.subtotal).toBe(200);
  });

  it('should apply percentage discount when provided', async () => {
    await service.addItem({ name: 'Keyboard', price: 100, quantity: 1, currency: 'USD' });

    const summary = await service.applyDiscount({ code: 'SAVE10', percentage: 10 });

    expect(summary.discountAmount).toBe(10);
    expect(summary.total).toBe(90);
  });
});
