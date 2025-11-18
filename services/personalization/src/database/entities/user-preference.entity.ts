import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PreferenceCategory {
  ROUTE = 'route',
  SEAT = 'seat',
  AMENITY = 'amenity',
  PRODUCT = 'product',
  NOTIFICATION = 'notification',
  PAYMENT = 'payment',
  ACCESSIBILITY = 'accessibility',
}

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: PreferenceCategory })
  category: PreferenceCategory;

  // Route preferences
  @Column({ type: 'jsonb', default: [] })
  favoriteRoutes: string[];

  @Column({ type: 'jsonb', default: [] })
  favoriteStops: string[];

  @Column({ type: 'jsonb', default: [] })
  preferredDepartureTime: string[]; // e.g., ["morning", "evening"]

  @Column({ type: 'boolean', default: false })
  preferExpressRoutes: boolean;

  @Column({ type: 'boolean', default: false })
  preferScenicRoutes: boolean;

  // Seat preferences
  @Column({ type: 'text', nullable: true })
  preferredSeatType: string; // window, aisle, front, back

  @Column({ type: 'text', nullable: true })
  preferredDeckLevel: string; // upper, lower

  @Column({ type: 'boolean', default: false })
  requiresWheelchairAccess: boolean;

  // Amenity preferences
  @Column({ type: 'boolean', default: false })
  prefersWifi: boolean;

  @Column({ type: 'boolean', default: false })
  prefersAirConditioning: boolean;

  @Column({ type: 'boolean', default: false })
  prefersUSBCharging: boolean;

  @Column({ type: 'boolean', default: false })
  prefersSnackBar: boolean;

  // Product preferences
  @Column({ type: 'jsonb', default: [] })
  favoriteProducts: string[];

  @Column({ type: 'jsonb', default: [] })
  productCategories: string[]; // Interested product categories

  // Notification preferences
  @Column({ type: 'boolean', default: true })
  enableEmailNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  enablePushNotifications: boolean;

  @Column({ type: 'boolean', default: false })
  enableSMSNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOnDeals: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOnBookingUpdates: boolean;

  // Payment preferences
  @Column({ type: 'text', nullable: true })
  preferredPaymentMethod: string;

  @Column({ type: 'text', nullable: true })
  preferredCurrency: string;

  // Budget preferences
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxBudgetPerTrip: number;

  @Column({ type: 'text', nullable: true })
  budgetTier: string; // budget, standard, premium

  // Language and accessibility
  @Column({ type: 'text', default: 'en' })
  preferredLanguage: string;

  @Column({ type: 'boolean', default: false })
  requiresLargeText: boolean;

  @Column({ type: 'boolean', default: false })
  requiresAudioAssistance: boolean;

  // Privacy
  @Column({ type: 'boolean', default: true })
  allowPersonalizedRecommendations: boolean;

  @Column({ type: 'boolean', default: true })
  allowDataCollection: boolean;

  @Column({ type: 'jsonb', default: {} })
  customPreferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
