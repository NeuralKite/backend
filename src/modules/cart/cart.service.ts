import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

export interface CartSummary {
  currency: string;
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  discountCode?: string;
}
      throw new NotFoundException(`Item with id "${id}" was not found.`);
    }
  }
        totalItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
    const subtotal = Number(
      items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2),
    );
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
      totalItems: items.length,
      totalQuantity,
      subtotal,
      discountAmount,
      total,
  }
}
