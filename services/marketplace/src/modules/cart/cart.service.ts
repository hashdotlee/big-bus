import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../database/entities/cart.entity';
import { Product } from '../../database/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productsService: ProductsService,
  ) {}

  async getOrCreateCart(customerId?: string, sessionId?: string): Promise<Cart> {
    if (!customerId && !sessionId) {
      throw new BadRequestException('Either customerId or sessionId must be provided');
    }

    let cart: Cart | null = null;

    if (customerId) {
      cart = await this.cartRepository.findOne({ where: { customerId } });
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({ where: { sessionId } });
    }

    if (!cart) {
      cart = this.cartRepository.create({
        customerId,
        sessionId,
        items: [],
        subtotal: 0,
        total: 0,
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(
    addToCartDto: AddToCartDto,
    customerId?: string,
    sessionId?: string
  ): Promise<Cart> {
    const { productId, variantId, quantity } = addToCartDto;

    // Get or create cart
    const cart = await this.getOrCreateCart(customerId, sessionId);

    // Get product details
    const product = await this.productsService.findOne(productId);

    // Check inventory
    const hasInventory = await this.productsService.checkInventory(productId, variantId, quantity);
    if (!hasInventory) {
      throw new BadRequestException(`Product "${product.name}" does not have sufficient inventory`);
    }

    // Get price and variant info
    let price = product.price;
    let variantName: string | undefined;

    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) {
        throw new NotFoundException(`Variant ${variantId} not found`);
      }
      price = variant.price || product.price;
      variantName = variant.name;
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      const newItem = {
        id: this.generateCartItemId(),
        productId,
        variantId,
        productName: product.name,
        variantName,
        quantity,
        price,
        total: price * quantity,
        image: product.images[0],
      };
      cart.items.push(newItem);
    }

    // Recalculate totals
    this.calculateCartTotals(cart);

    return await this.cartRepository.save(cart);
  }

  async updateCartItem(
    updateCartItemDto: UpdateCartItemDto,
    customerId?: string,
    sessionId?: string
  ): Promise<Cart> {
    const { cartItemId, quantity } = updateCartItemDto;

    const cart = await this.getOrCreateCart(customerId, sessionId);

    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Check inventory
      const item = cart.items[itemIndex];
      const hasInventory = await this.productsService.checkInventory(
        item.productId,
        item.variantId,
        quantity
      );

      if (!hasInventory) {
        throw new BadRequestException(`Insufficient inventory for ${item.productName}`);
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;
    }

    // Recalculate totals
    this.calculateCartTotals(cart);

    return await this.cartRepository.save(cart);
  }

  async removeFromCart(
    removeFromCartDto: RemoveFromCartDto,
    customerId?: string,
    sessionId?: string
  ): Promise<Cart> {
    const { cartItemId } = removeFromCartDto;

    const cart = await this.getOrCreateCart(customerId, sessionId);

    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    this.calculateCartTotals(cart);

    return await this.cartRepository.save(cart);
  }

  async clearCart(customerId?: string, sessionId?: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(customerId, sessionId);

    cart.items = [];
    cart.subtotal = 0;
    cart.total = 0;

    return await this.cartRepository.save(cart);
  }

  async getCart(customerId?: string, sessionId?: string): Promise<Cart> {
    return await this.getOrCreateCart(customerId, sessionId);
  }

  async mergeGuestCart(guestSessionId: string, customerId: string): Promise<Cart> {
    // Get guest cart
    const guestCart = await this.cartRepository.findOne({ where: { sessionId: guestSessionId } });

    if (!guestCart || guestCart.items.length === 0) {
      return await this.getOrCreateCart(customerId);
    }

    // Get or create customer cart
    let customerCart = await this.cartRepository.findOne({ where: { customerId } });

    if (!customerCart) {
      // If customer has no cart, convert guest cart to customer cart
      guestCart.customerId = customerId;
      guestCart.sessionId = null;
      return await this.cartRepository.save(guestCart);
    }

    // Merge items from guest cart to customer cart
    for (const guestItem of guestCart.items) {
      const existingItemIndex = customerCart.items.findIndex(
        item => item.productId === guestItem.productId && item.variantId === guestItem.variantId
      );

      if (existingItemIndex >= 0) {
        // Add quantity to existing item
        customerCart.items[existingItemIndex].quantity += guestItem.quantity;
        customerCart.items[existingItemIndex].total =
          customerCart.items[existingItemIndex].price * customerCart.items[existingItemIndex].quantity;
      } else {
        // Add new item
        customerCart.items.push(guestItem);
      }
    }

    // Recalculate totals
    this.calculateCartTotals(customerCart);

    // Delete guest cart
    await this.cartRepository.remove(guestCart);

    return await this.cartRepository.save(customerCart);
  }

  async validateCart(customerId?: string, sessionId?: string): Promise<{
    valid: boolean;
    errors: string[];
    cart: Cart;
  }> {
    const cart = await this.getOrCreateCart(customerId, sessionId);
    const errors: string[] = [];

    for (const item of cart.items) {
      try {
        // Check if product still exists and is active
        const product = await this.productsService.findOne(item.productId);

        if (product.status !== 'active') {
          errors.push(`Product "${item.productName}" is no longer available`);
          continue;
        }

        // Check inventory
        const hasInventory = await this.productsService.checkInventory(
          item.productId,
          item.variantId,
          item.quantity
        );

        if (!hasInventory) {
          errors.push(`Insufficient inventory for "${item.productName}"`);
        }

        // Check if price has changed
        let currentPrice = product.price;
        if (item.variantId && product.variants) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant && variant.price) {
            currentPrice = variant.price;
          }
        }

        if (currentPrice !== item.price) {
          errors.push(`Price for "${item.productName}" has changed from $${item.price} to $${currentPrice}`);
        }
      } catch (error) {
        errors.push(`Product "${item.productName}" is no longer available`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      cart,
    };
  }

  async getCartCount(customerId?: string, sessionId?: string): Promise<number> {
    const cart = await this.getOrCreateCart(customerId, sessionId);
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }

  private calculateCartTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + Number(item.total), 0);
    // For now, total equals subtotal. You can add tax, shipping, discounts later
    cart.total = cart.subtotal;
  }

  private generateCartItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
