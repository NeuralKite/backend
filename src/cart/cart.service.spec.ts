import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from '../catalog/entities/item.entity';
import { ItemType } from '../catalog/enums/item-type.enum';
import { Customer } from '../customers/entities/customer.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
  [key: string]: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
});

describe('CartService', () => {
  let service: CartService;
  let orderRepository: MockRepository<Order>;
  let orderItemRepository: MockRepository<OrderItem>;
  let statusHistoryRepository: MockRepository<OrderStatusHistory>;
  let itemRepository: MockRepository<Item>;
  let customerRepository: MockRepository<Customer>;

  const customer: Customer = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    orders: [],
  };

  const taxRate = {
    id: '10',
    name: 'IVA',
    percentage: '16.00',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

  const item: Item = {
    id: '2',
    name: 'Entrada concierto',
    description: 'Acceso general',
    imageUrl: null,
    sku: 'SKU-001',
    price: '150.00',
    type: ItemType.Event,
    stockQuantity: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    taxRate,
    category: null,
    orderItems: [],
  } as unknown as Item;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Order),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(OrderStatusHistory),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Item),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    statusHistoryRepository = module.get(
      getRepositoryToken(OrderStatusHistory),
    );
    itemRepository = module.get(getRepositoryToken(Item));
    customerRepository = module.get(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('agrega un nuevo artículo al carrito creando la orden si no existe', async () => {
    const dto: CreateCartItemDto = {
      customerId: customer.id,
      itemId: item.id,
      quantity: 2,
    };

    const order: Order = {
      id: '100',
      customer,
      items: [],
      status: OrderStatus.Draft,
      statusHistory: [],
      subtotalAmount: '0.00',
      taxAmount: '0.00',
      totalAmount: '0.00',
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderItem: OrderItem = {
      id: '200',
      order,
      item,
      quantity: 2,
      unitPrice: '0.00',
      taxPercentage: '0.00',
      taxAmount: '0.00',
      subtotalAmount: '0.00',
      totalAmount: '0.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    itemRepository.findOne.mockResolvedValue(item);
    customerRepository.findOne.mockResolvedValue(customer);
    orderRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...order,
        items: [
          {
            ...orderItem,
            unitPrice: '150.00',
            subtotalAmount: '300.00',
            totalAmount: '348.00',
            item,
          },
        ],
        subtotalAmount: '300.00',
        taxAmount: '48.00',
        totalAmount: '348.00',
      });
    orderRepository.create.mockReturnValue(order);
    orderRepository.save.mockResolvedValue(order);
    statusHistoryRepository.create.mockReturnValue({});
    statusHistoryRepository.save.mockResolvedValue({});
    orderItemRepository.findOne.mockResolvedValue(null);
    orderItemRepository.create.mockReturnValue(orderItem);
    orderItemRepository.save.mockResolvedValue(orderItem);
    orderItemRepository.find.mockResolvedValue([
      {
        ...orderItem,
        subtotalAmount: '300.00',
        taxAmount: '48.00',
      },
    ]);

    const summary = await service.addItemToCart(dto);

    expect(orderRepository.create).toHaveBeenCalled();
    expect(orderItemRepository.save).toHaveBeenCalled();
    expect(orderRepository.update).toHaveBeenCalledWith(order.id, {
      subtotalAmount: '300.00',
      taxAmount: '48.00',
      totalAmount: '348.00',
    });
    expect(summary.items).toHaveLength(1);
    expect(summary.totals.total).toBe('348.00');
  });

  it('actualiza la cantidad de un artículo existente en el carrito', async () => {
    const dto: UpdateCartItemDto = {
      customerId: customer.id,
      quantity: 1,
    };

    const order: Order = {
      id: '100',
      customer,
      items: [],
      status: OrderStatus.Draft,
      statusHistory: [],
      subtotalAmount: '0.00',
      taxAmount: '0.00',
      totalAmount: '0.00',
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderItem: OrderItem = {
      id: '200',
      order,
      item,
      quantity: 2,
      unitPrice: '150.00',
      taxPercentage: '16.00',
      taxAmount: '48.00',
      subtotalAmount: '300.00',
      totalAmount: '348.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orderRepository.findOne
      .mockResolvedValueOnce(order)
      .mockResolvedValueOnce({
        ...order,
        items: [
          {
            ...orderItem,
            quantity: 1,
            subtotalAmount: '150.00',
            totalAmount: '174.00',
            item,
          },
        ],
        subtotalAmount: '150.00',
        taxAmount: '24.00',
        totalAmount: '174.00',
      });
    orderItemRepository.findOne.mockResolvedValue(orderItem);
    orderItemRepository.save.mockResolvedValue(orderItem);
    orderItemRepository.find.mockResolvedValue([
      {
        ...orderItem,
        quantity: 1,
        subtotalAmount: '150.00',
        taxAmount: '24.00',
      },
    ]);

    const summary = await service.updateItemQuantity(item.id, dto);

    expect(orderItemRepository.save).toHaveBeenCalled();
    expect(orderRepository.update).toHaveBeenCalledWith(order.id, {
      subtotalAmount: '150.00',
      taxAmount: '24.00',
      totalAmount: '174.00',
    });
    expect(summary.totals.total).toBe('174.00');
  });

  it('elimina el artículo si la cantidad actualizada es cero', async () => {
    const dto: UpdateCartItemDto = {
      customerId: customer.id,
      quantity: 0,
    };

    const order: Order = {
      id: '100',
      customer,
      items: [],
      status: OrderStatus.Draft,
      statusHistory: [],
      subtotalAmount: '0.00',
      taxAmount: '0.00',
      totalAmount: '0.00',
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderItem: OrderItem = {
      id: '200',
      order,
      item,
      quantity: 1,
      unitPrice: '150.00',
      taxPercentage: '16.00',
      taxAmount: '24.00',
      subtotalAmount: '150.00',
      totalAmount: '174.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orderRepository.findOne
      .mockResolvedValueOnce(order)
      .mockResolvedValueOnce({
        ...order,
        items: [],
        subtotalAmount: '0.00',
        taxAmount: '0.00',
        totalAmount: '0.00',
      });
    orderItemRepository.findOne.mockResolvedValue(orderItem);
    orderItemRepository.remove.mockResolvedValue(orderItem);
    orderItemRepository.find.mockResolvedValue([]);

    const summary = await service.updateItemQuantity(item.id, dto);

    expect(orderItemRepository.remove).toHaveBeenCalledWith(orderItem);
    expect(summary.items).toHaveLength(0);
    expect(summary.totals.total).toBe('0.00');
  });

  it('lanza error si se intenta agregar más cantidad de la disponible', async () => {
    const dto: CreateCartItemDto = {
      customerId: customer.id,
      itemId: item.id,
      quantity: 20,
    };

    const order: Order = {
      id: '500',
      customer,
      items: [],
      status: OrderStatus.Draft,
      statusHistory: [],
      subtotalAmount: '0.00',
      taxAmount: '0.00',
      totalAmount: '0.00',
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    itemRepository.findOne.mockResolvedValue({ ...item, stockQuantity: 5 });
    customerRepository.findOne.mockResolvedValue(customer);
    orderRepository.findOne.mockResolvedValue(order);

    await expect(service.addItemToCart(dto)).rejects.toThrow(
      /No hay suficiente stock/,
    );
  });
});
