import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  BUNDLE = 'bundle',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  sellerId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.PHYSICAL })
  type: ProductType;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ type: 'jsonb', nullable: true })
  variants: any[];

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ default: true })
  trackInventory: boolean;

  @Column({ type: 'int', nullable: true })
  lowStockThreshold: number;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ default: false })
  isAvailableOnBus: boolean;

  @Column({ type: 'text', array: true, default: [] })
  availableRoutes: string[];

  @Column({ nullable: true })
  seoTitle: string;

  @Column({ type: 'text', nullable: true })
  seoDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
