import { Module } from '@nestjs/common';
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
