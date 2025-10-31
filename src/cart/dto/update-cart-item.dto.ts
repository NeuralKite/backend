import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Identificador del cliente' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Cantidad deseada para el artículo',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}
