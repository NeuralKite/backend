import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from '../catalog/entities/item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { CartSummaryDto, CartSummaryItemDto } from './dto/cart-summary.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly statusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async addItemToCart({
    customerId,
    itemId,
    quantity,
  }: CreateCartItemDto): Promise<CartSummaryDto> {
    const item = await this.ensureItem(itemId);
    const order = await this.getOrCreateDraftOrder(customerId);

    const existingOrderItem = await this.orderItemRepository.findOne({
      where: {
        order: { id: order.id },
        item: { id: item.id },
      },
      relations: { item: true, order: true },
    });

    if (existingOrderItem) {
      const updatedQuantity = existingOrderItem.quantity + quantity;
      this.ensureStockAvailability(item, updatedQuantity);
      this.applyLineAmounts(existingOrderItem, item, updatedQuantity);
      await this.orderItemRepository.save(existingOrderItem);
    } else {
      this.ensureStockAvailability(item, quantity);
      const orderItem = this.orderItemRepository.create({
        order,
        item,
        quantity,
      });
      this.applyLineAmounts(orderItem, item, quantity);
      await this.orderItemRepository.save(orderItem);
    }

    await this.recalculateOrderTotals(order.id);
    return this.getCartSummary(customerId);
  }

  async updateItemQuantity(
    itemId: string,
    { customerId, quantity }: UpdateCartItemDto,
  ): Promise<CartSummaryDto> {
    const order = await this.getDraftOrderOrFail(customerId);
    const orderItem = await this.orderItemRepository.findOne({
      where: {
        order: { id: order.id },
        item: { id: itemId },
      },
      relations: { item: true },
    });

    if (!orderItem) {
      throw new NotFoundException('El artículo no se encuentra en el carrito');
    }

    if (quantity <= 0) {
      await this.orderItemRepository.remove(orderItem);
    } else {
      this.ensureStockAvailability(orderItem.item, quantity);
      this.applyLineAmounts(orderItem, orderItem.item, quantity);
      await this.orderItemRepository.save(orderItem);
    }

    await this.recalculateOrderTotals(order.id);
    return this.getCartSummary(customerId);
  }

  async removeItemFromCart(
    customerId: string,
    itemId: string,
  ): Promise<CartSummaryDto> {
    const order = await this.getDraftOrderOrFail(customerId);
    const orderItem = await this.orderItemRepository.findOne({
      where: {
        order: { id: order.id },
        item: { id: itemId },
      },
    });

    if (!orderItem) {
      throw new NotFoundException('El artículo no se encuentra en el carrito');
    }

    await this.orderItemRepository.remove(orderItem);
    await this.recalculateOrderTotals(order.id);
    return this.getCartSummary(customerId);
  }

  async getCartSummary(customerId: string): Promise<CartSummaryDto> {
    const order = await this.orderRepository.findOne({
      where: {
        customer: { id: customerId },
        status: OrderStatus.Draft,
      },
      relations: {
        items: {
          item: {
            taxRate: true,
          },
        },
        customer: true,
      },
      order: {
        items: {
          id: 'ASC',
        },
      },
    });

    if (!order) {
      return {
        customerId,
        items: [],
        totals: {
          subtotal: '0.00',
          tax: '0.00',
          total: '0.00',
        },
      };
    }

    const items: CartSummaryItemDto[] = order.items.map((orderItem) => {
      const unitPrice = this.formatAmount(parseFloat(orderItem.unitPrice));
      return {
        itemId: orderItem.item.id,
        name: orderItem.item.name,
        type: orderItem.item.type,
        quantity: orderItem.quantity,
        unitPrice,
        subtotal: this.formatAmount(
          parseFloat(orderItem.unitPrice) * orderItem.quantity,
        ),
      };
    });

    return {
      customerId,
      items,
      totals: {
        subtotal: this.formatAmount(parseFloat(order.subtotalAmount)),
        tax: this.formatAmount(parseFloat(order.taxAmount)),
        total: this.formatAmount(parseFloat(order.totalAmount)),
      },
    };
  }

  private async ensureItem(itemId: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: { taxRate: true },
    });

    if (!item || !item.isActive) {
      throw new NotFoundException('El artículo solicitado no está disponible');
    }

    return item;
  }

  private async getDraftOrderOrFail(customerId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        customer: { id: customerId },
        status: OrderStatus.Draft,
      },
      relations: { customer: true },
    });

    if (!order) {
      throw new NotFoundException('No se encontró un carrito para el cliente');
    }

    return order;
  }

  private async getOrCreateDraftOrder(customerId: string): Promise<Order> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('El cliente especificado no existe');
    }

    const existingOrder = await this.orderRepository.findOne({
      where: {
        customer: { id: customerId },
        status: OrderStatus.Draft,
      },
      relations: { customer: true },
    });

    if (existingOrder) {
      return existingOrder;
    }

    let order = this.orderRepository.create({
      customer,
      status: OrderStatus.Draft,
      subtotalAmount: '0.00',
      taxAmount: '0.00',
      totalAmount: '0.00',
    });

    order = await this.orderRepository.save(order);

    const history = this.statusHistoryRepository.create({
      order,
      newStatus: OrderStatus.Draft,
      oldStatus: null,
    });
    await this.statusHistoryRepository.save(history);

    return order;
  }

  private ensureStockAvailability(item: Item, quantity: number): void {
    if (quantity > item.stockQuantity) {
      throw new BadRequestException(
        `No hay suficiente stock para "${item.name}". Disponible: ${item.stockQuantity}`,
      );
    }
  }

  private applyLineAmounts(
    target: OrderItem,
    item: Item,
    quantity: number,
  ): void {
    const unitPrice = parseFloat(item.price);
    const taxRate = item.taxRate ? parseFloat(item.taxRate.percentage) : 0;
    const subtotal = unitPrice * quantity;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    target.quantity = quantity;
    target.unitPrice = this.formatAmount(unitPrice);
    target.taxPercentage = this.formatAmount(taxRate);
    target.taxAmount = this.formatAmount(taxAmount);
    target.subtotalAmount = this.formatAmount(subtotal);
    target.totalAmount = this.formatAmount(total);
  }

  private async recalculateOrderTotals(orderId: string): Promise<void> {
    const items = await this.orderItemRepository.find({
      where: { order: { id: orderId } },
    });

    const subtotal = items.reduce(
      (total, item) => total + parseFloat(item.subtotalAmount),
      0,
    );
    const tax = items.reduce(
      (total, item) => total + parseFloat(item.taxAmount),
      0,
    );
    const totalAmount = subtotal + tax;

    await this.orderRepository.update(orderId, {
      subtotalAmount: this.formatAmount(subtotal),
      taxAmount: this.formatAmount(tax),
      totalAmount: this.formatAmount(totalAmount),
    });
  }

  private formatAmount(value: number): string {
    return (Math.round(value * 100) / 100).toFixed(2);
  }
}
