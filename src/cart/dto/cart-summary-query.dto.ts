import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CartSummaryQueryDto {
  @ApiProperty({ description: 'Identificador del cliente del cual se consulta el carrito' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
