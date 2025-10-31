import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CartItemQueryDto {
  @ApiProperty({ description: 'Identificador del cliente propietario del carrito' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
