import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { CartItemQueryDto } from './dto/cart-item-query.dto';
import { CartSummaryDto } from './dto/cart-summary.dto';
import { CartSummaryQueryDto } from './dto/cart-summary-query.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un artículo al carrito' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CartSummaryDto })
  async addItem(@Body() dto: CreateCartItemDto): Promise<CartSummaryDto> {
    return this.cartService.addItemToCart(dto);
  }

  @Put(':itemId')
  @ApiOperation({ summary: 'Actualizar la cantidad de un artículo' })
  @ApiParam({ name: 'itemId', description: 'Identificador del artículo' })
  @ApiResponse({ status: HttpStatus.OK, type: CartSummaryDto })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartSummaryDto> {
    return this.cartService.updateItemQuantity(itemId, dto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Eliminar un artículo del carrito' })
  @ApiParam({ name: 'itemId', description: 'Identificador del artículo' })
  @ApiResponse({ status: HttpStatus.OK, type: CartSummaryDto })
  async removeItem(
    @Param('itemId') itemId: string,
    @Query() query: CartItemQueryDto,
  ): Promise<CartSummaryDto> {
    return this.cartService.removeItemFromCart(query.customerId, itemId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener el resumen del carrito' })
  @ApiResponse({ status: HttpStatus.OK, type: CartSummaryDto })
  async summary(
    @Query() query: CartSummaryQueryDto,
  ): Promise<CartSummaryDto> {
    return this.cartService.getCartSummary(query.customerId);
  }
}
