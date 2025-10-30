import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({ example: 'SUMMER10' })
  @IsString()
  readonly code!: string;

  @ApiProperty({ example: 10, description: 'Percentage discount to apply to the cart' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  readonly percentage?: number;
}
