import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    return await this.cartService.getCart(userId, sessionId);
  }

  @Get('count')
  async getCartCount(
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    const count = await this.cartService.getCartCount(userId, sessionId);
    return { count };
  }

  @Get('validate')
  async validateCart(
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    return await this.cartService.validateCart(userId, sessionId);
  }

  @Post('add')
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    return await this.cartService.addToCart(addToCartDto, userId, sessionId);
  }

  @Patch('update')
  async updateCartItem(
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    return await this.cartService.updateCartItem(updateCartItemDto, userId, sessionId);
  }

  @Post('remove')
  async removeFromCart(
    @Body() removeFromCartDto: RemoveFromCartDto,
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    return await this.cartService.removeFromCart(removeFromCartDto, userId, sessionId);
  }

  @Delete('clear')
  async clearCart(
    @Query('customerId') customerId?: string,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    return await this.cartService.clearCart(userId, sessionId);
  }

  @Post('merge')
  async mergeGuestCart(
    @Body('guestSessionId') guestSessionId: string,
    @Body('customerId') customerId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || customerId;
    if (!userId) {
      throw new Error('Customer ID is required for merging carts');
    }
    return await this.cartService.mergeGuestCart(guestSessionId, userId);
  }
}
