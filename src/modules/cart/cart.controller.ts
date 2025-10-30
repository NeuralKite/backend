import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { CartSummaryResponseDto } from './dto/cart-summary-response.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

@ApiTags('cart')
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @ApiCreatedResponse({
    description: 'Item successfully added to the cart.',
    type: CartItemResponseDto,
  })
  create(@Body() payload: CreateCartItemDto): CartItemResponseDto {
    const item = this.cartService.addItem(payload);
    return item.toJSON();
  }

  @Get('items')
  @ApiOkResponse({
    description: 'List of items currently in the cart.',
    type: CartItemResponseDto,
    isArray: true,
  })
  findAll(): CartItemResponseDto[] {
    return this.cartService.listItems().map((item) => item.toJSON());
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Item removed from the cart.' })
  remove(@Param('id') id: string): void {
    this.cartService.removeItem(id);
  }

  @Post('discount')
  @ApiOkResponse({
    description: 'Summary of the cart after applying the discount.',
    type: CartSummaryResponseDto,
  })
  applyDiscount(@Body() payload: ApplyDiscountDto): CartSummaryResponseDto {
    return this.cartService.applyDiscount(payload);
  }

  @Get('summary')
  @ApiOkResponse({
    description: 'Summary of the cart totals.',
    type: CartSummaryResponseDto,
  })
  summary(): CartSummaryResponseDto {
    return this.cartService.summary();
  }
}
