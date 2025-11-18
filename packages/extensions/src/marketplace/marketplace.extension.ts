import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * Product types
 */
export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  BUNDLE = 'bundle',
  SUBSCRIPTION = 'subscription',
}

/**
 * Product status
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

/**
 * Order status
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Marketplace configuration
 */
export interface MarketplaceConfig {
  allowThirdPartySellers?: boolean;
  commissionRate?: number;
  autoApproveProducts?: boolean;
  supportDigitalProducts?: boolean;
  [key: string]: any;
}

/**
 * Product
 */
export interface Product {
  productId: string;
  sellerId?: string;
  name: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
  costPrice?: number;
  images: string[];
  variants?: ProductVariant[];
  inventory?: {
    quantity: number;
    trackInventory: boolean;
    lowStockThreshold?: number;
  };
  attributes?: Record<string, any>;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  isAvailableOnBus?: boolean; // Specific to bus service
  availableRoutes?: string[]; // Which bus routes this product is available on
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Product variant
 */
export interface ProductVariant {
  variantId: string;
  name: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  inventory?: number;
  attributes: Record<string, string>; // e.g., { size: 'M', color: 'Red' }
  image?: string;
}

/**
 * Product creation request
 */
export interface ProductCreateRequest {
  sellerId?: string;
  name: string;
  description: string;
  type: ProductType;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
  images: string[];
  variants?: Omit<ProductVariant, 'variantId'>[];
  inventory?: {
    quantity: number;
    trackInventory: boolean;
  };
  attributes?: Record<string, any>;
  tags?: string[];
  isAvailableOnBus?: boolean;
  availableRoutes?: string[];
}

/**
 * Order
 */
export interface Order {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  deliveryMethod?: 'delivery' | 'pickup' | 'on_bus'; // Specific to bus service
  busBookingId?: string; // Link to bus booking if purchased on bus
  pickupLocation?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Order item
 */
export interface OrderItem {
  orderItemId: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  tax: number;
  discount: number;
  total: number;
  metadata?: Record<string, any>;
}

/**
 * Address
 */
export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  phone: string;
}

/**
 * Cart
 */
export interface Cart {
  cartId: string;
  customerId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Cart item
 */
export interface CartItem {
  cartItemId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  metadata?: Record<string, any>;
}

/**
 * Inventory update request
 */
export interface InventoryUpdateRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  operation: 'set' | 'increment' | 'decrement';
}

/**
 * Base interface for marketplace extensions
 */
export interface IMarketplaceExtension extends BaseExtension {
  readonly category: ExtensionCategory.MARKETPLACE;

  /**
   * Get product by ID
   */
  getProduct(productId: string): Promise<Product>;

  /**
   * Create product
   */
  createProduct(request: ProductCreateRequest): Promise<Product>;

  /**
   * Update product
   */
  updateProduct(productId: string, updates: Partial<Product>): Promise<Product>;

  /**
   * Delete product
   */
  deleteProduct(productId: string): Promise<void>;

  /**
   * Search products
   */
  searchProducts(query: {
    keyword?: string;
    category?: string;
    type?: ProductType;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    availableOnRoute?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }>;

  /**
   * Get cart
   */
  getCart(cartId: string): Promise<Cart>;

  /**
   * Add to cart
   */
  addToCart(cartId: string, item: Omit<CartItem, 'cartItemId'>): Promise<Cart>;

  /**
   * Update cart item
   */
  updateCartItem(cartId: string, cartItemId: string, quantity: number): Promise<Cart>;

  /**
   * Remove from cart
   */
  removeFromCart(cartId: string, cartItemId: string): Promise<Cart>;

  /**
   * Create order
   */
  createOrder(order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Promise<Order>;

  /**
   * Get order
   */
  getOrder(orderId: string): Promise<Order>;

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;

  /**
   * Update inventory
   */
  updateInventory(request: InventoryUpdateRequest): Promise<void>;

  /**
   * Check inventory availability
   */
  checkInventory(productId: string, variantId?: string, quantity?: number): Promise<boolean>;
}

/**
 * Abstract base class for marketplace extensions
 */
export abstract class BaseMarketplaceExtension
  extends BaseExtension
  implements IMarketplaceExtension
{
  readonly category = ExtensionCategory.MARKETPLACE;
  protected marketplaceConfig: MarketplaceConfig;

  abstract getProduct(productId: string): Promise<Product>;
  abstract createProduct(request: ProductCreateRequest): Promise<Product>;
  abstract updateProduct(productId: string, updates: Partial<Product>): Promise<Product>;
  abstract deleteProduct(productId: string): Promise<void>;
  abstract searchProducts(query: any): Promise<{ products: Product[]; total: number }>;
  abstract getCart(cartId: string): Promise<Cart>;
  abstract addToCart(cartId: string, item: Omit<CartItem, 'cartItemId'>): Promise<Cart>;
  abstract updateCartItem(cartId: string, cartItemId: string, quantity: number): Promise<Cart>;
  abstract removeFromCart(cartId: string, cartItemId: string): Promise<Cart>;
  abstract createOrder(order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  abstract getOrder(orderId: string): Promise<Order>;
  abstract updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  abstract updateInventory(request: InventoryUpdateRequest): Promise<void>;
  abstract checkInventory(productId: string, variantId?: string, quantity?: number): Promise<boolean>;

  async initialize(config: MarketplaceConfig): Promise<void> {
    await super.initialize(config);
    this.marketplaceConfig = config;
  }

  protected generateProductId(): string {
    return `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected generateOrderId(): string {
    return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected generateCartId(): string {
    return `CART_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
