import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsPositive, IsString, Min } from 'class-validator';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN'] as const;

type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export class CreateCartItemDto {
  @ApiProperty({ example: 'Wireless mouse' })
  @IsString()
  readonly name!: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly price!: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  readonly quantity!: number;

  @ApiProperty({ enum: SUPPORTED_CURRENCIES, example: 'USD' })
  @IsIn(SUPPORTED_CURRENCIES)
  readonly currency!: SupportedCurrency;
}
