import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({ description: 'Identificador del cliente' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Identificador del artículo a agregar' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ description: 'Cantidad a agregar', default: 1, minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity = 1;
}
