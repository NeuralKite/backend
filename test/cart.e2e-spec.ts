import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { ItemType } from '../src/catalog/enums/item-type.enum';
import { CartController } from '../src/cart/cart.controller';
import { CartService } from '../src/cart/cart.service';
import { CartSummaryDto } from '../src/cart/dto/cart-summary.dto';
import { CreateCartItemDto } from '../src/cart/dto/create-cart-item.dto';
import { UpdateCartItemDto } from '../src/cart/dto/update-cart-item.dto';

interface InMemoryItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  stockQuantity: number;
}

class InMemoryCartService {
  private readonly items = new Map<string, InMemoryItem>();
  private readonly cart = new Map<string, Map<string, number>>();

  constructor(initialItems: InMemoryItem[]) {
    initialItems.forEach((item) => this.items.set(item.id, item));
  }

  reset(): void {
    this.cart.clear();
  }

  async addItemToCart(dto: CreateCartItemDto): Promise<CartSummaryDto> {
    const { customerId, itemId, quantity } = dto;
    const item = this.ensureItem(itemId);
    const cart = this.ensureCustomerCart(customerId);
    const current = cart.get(itemId) ?? 0;
    const desired = current + quantity;
    this.ensureStock(item, desired);
    cart.set(itemId, desired);
    return this.buildSummary(customerId);
  }

  async updateItemQuantity(
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartSummaryDto> {
    const { customerId, quantity } = dto;
    const item = this.ensureItem(itemId);
    const cart = this.ensureCustomerCart(customerId);
    if (!cart.has(itemId)) {
      throw new NotFoundException('El artículo no se encuentra en el carrito');
    }
    if (quantity <= 0) {
      cart.delete(itemId);
    } else {
      this.ensureStock(item, quantity);
      cart.set(itemId, quantity);
    }
    return this.buildSummary(customerId);
  }

  async removeItemFromCart(
    customerId: string,
    itemId: string,
  ): Promise<CartSummaryDto> {
    const cart = this.ensureCustomerCart(customerId);
    if (!cart.delete(itemId)) {
      throw new NotFoundException('El artículo no se encuentra en el carrito');
    }
    return this.buildSummary(customerId);
  }

  async getCartSummary(customerId: string): Promise<CartSummaryDto> {
    this.ensureCustomerCart(customerId);
    return this.buildSummary(customerId);
  }

  private ensureCustomerCart(customerId: string): Map<string, number> {
    if (!this.cart.has(customerId)) {
      this.cart.set(customerId, new Map());
    }
    return this.cart.get(customerId) as Map<string, number>;
  }

  private ensureItem(itemId: string): InMemoryItem {
    const item = this.items.get(itemId);
    if (!item) {
      throw new NotFoundException('El artículo solicitado no está disponible');
    }
    return item;
  }

  private ensureStock(item: InMemoryItem, quantity: number): void {
    if (quantity > item.stockQuantity) {
      throw new BadRequestException(
        `No hay suficiente stock para "${item.name}". Disponible: ${item.stockQuantity}`,
      );
    }
  }

  private buildSummary(customerId: string): CartSummaryDto {
    const cart = this.ensureCustomerCart(customerId);
    const items = Array.from(cart.entries()).map(([itemId, quantity]) => {
      const item = this.items.get(itemId) as InMemoryItem;
      const unitPrice = item.price;
      const subtotal = unitPrice * quantity;
      const tax = subtotal * 0.16;
      return {
        itemId,
        name: item.name,
        type: item.type,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
        tax,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal + tax;

    return {
      customerId,
      items: items.map(({ tax: _tax, ...rest }) => rest),
      totals: {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      },
    };
  }
}

describe('CartController (e2e)', () => {
  let app: INestApplication;
  let service: InMemoryCartService;

  const customerId = 'customer-1';
  const itemId = 'item-1';

  beforeAll(async () => {
    service = new InMemoryCartService([
      {
        id: itemId,
        name: 'Concierto de rock',
        type: ItemType.Event,
        price: 150,
        stockQuantity: 10,
      },
    ]);

    const moduleRef = await Test.createTestingModule({
      controllers: [CartController],
      providers: [CartService],
    })
      .overrideProvider(CartService)
      .useValue(service)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    service.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('agrega un artículo al carrito y calcula los totales', async () => {
    const response = await request(app.getHttpServer())
      .post('/cart')
      .send({
        customerId,
        itemId,
        quantity: 2,
      } satisfies CreateCartItemDto)
      .expect(201);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      itemId,
      quantity: 2,
      unitPrice: '150.00',
      subtotal: '300.00',
      type: ItemType.Event,
    });
    expect(response.body.totals).toMatchObject({
      subtotal: '300.00',
      tax: '48.00',
      total: '348.00',
    });
  });

  it('incrementa la cantidad cuando se agrega el mismo artículo', async () => {
    await request(app.getHttpServer())
      .post('/cart')
      .send({ customerId, itemId, quantity: 2 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/cart')
      .send({ customerId, itemId, quantity: 1 })
      .expect(201);

    expect(response.body.items[0].quantity).toBe(3);
    expect(response.body.totals.total).toBe('522.00');
  });

  it('actualiza la cantidad de un artículo existente', async () => {
    await request(app.getHttpServer())
      .post('/cart')
      .send({ customerId, itemId, quantity: 2 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .put(`/cart/${itemId}`)
      .send({ customerId, quantity: 1 } satisfies UpdateCartItemDto)
      .expect(200);

    expect(response.body.items[0].quantity).toBe(1);
    expect(response.body.totals.total).toBe('174.00');
  });

  it('elimina el artículo cuando la cantidad llega a cero', async () => {
    await request(app.getHttpServer())
      .post('/cart')
      .send({ customerId, itemId, quantity: 1 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .delete(`/cart/${itemId}`)
      .query({ customerId })
      .expect(200);

    expect(response.body.items).toHaveLength(0);
    expect(response.body.totals.total).toBe('0.00');
  });

  it('devuelve un resumen vacío para un carrito sin artículos', async () => {
    const response = await request(app.getHttpServer())
      .get('/cart/summary')
      .query({ customerId })
      .expect(200);

    expect(response.body.items).toHaveLength(0);
    expect(response.body.totals.total).toBe('0.00');
  });

  it('valida el stock disponible antes de agregar un artículo', async () => {
    await request(app.getHttpServer())
      .post('/cart')
      .send({ customerId, itemId, quantity: 11 })
      .expect(400);
  });
});
