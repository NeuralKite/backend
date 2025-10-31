import { ApiProperty } from '@nestjs/swagger';

import { ItemType } from '../../catalog/enums/item-type.enum';

export class CartSummaryItemDto {
  @ApiProperty({ description: 'Identificador del artículo' })
  itemId: string;

  @ApiProperty({ description: 'Nombre del artículo' })
  name: string;

  @ApiProperty({
    description: 'Tipo de artículo (producto o evento)',
    enum: ItemType,
  })
  type: ItemType;

  @ApiProperty({ description: 'Cantidad de unidades en el carrito' })
  quantity: number;

  @ApiProperty({ description: 'Precio unitario del artículo', example: '99.90' })
  unitPrice: string;

  @ApiProperty({ description: 'Subtotal para el artículo', example: '199.80' })
  subtotal: string;
}

export class CartSummaryDto {
  @ApiProperty({ description: 'Identificador del cliente' })
  customerId: string;

  @ApiProperty({ type: [CartSummaryItemDto] })
  items: CartSummaryItemDto[];

  @ApiProperty({
    description: 'Totales acumulados del carrito',
    example: { subtotal: '199.80', tax: '31.97', total: '231.77' },
  })
  totals: {
    subtotal: string;
    tax: string;
    total: string;
  };
}
