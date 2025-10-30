import { ApiProperty } from '@nestjs/swagger';

export class CartSummaryResponseDto {
  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 2 })
  totalItems!: number;

  @ApiProperty({ example: 3 })
  totalQuantity!: number;

  @ApiProperty({ example: 149.98 })
  subtotal!: number;

  @ApiProperty({ example: 10 })
  discountAmount!: number;

  @ApiProperty({ example: 139.98 })
  total!: number;

  @ApiProperty({ example: 'SUMMER10', required: false })
  discountCode?: string;
}
