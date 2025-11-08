import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum GatewayProvider {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
}

export enum RequestType {
  PAYMENT_REQUEST = 'payment_request',
  PAYMENT_CALLBACK = 'payment_callback',
  REFUND_REQUEST = 'refund_request',
  QUERY_REQUEST = 'query_request',
}

@Entity('payment_gateway_logs')
@Index(['transactionId'])
@Index(['provider'])
@Index(['requestType'])
@Index(['createdAt'])
export class PaymentGatewayLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id', nullable: true })
  @Index()
  transactionId: string;

  @Column({
    type: 'enum',
    enum: GatewayProvider,
  })
  provider: GatewayProvider;

  @Column({
    type: 'enum',
    enum: RequestType,
  })
  requestType: RequestType;

  @Column({ type: 'text', nullable: true })
  requestUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  requestBody: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  responseBody: Record<string, any>;

  @Column({ name: 'response_status', nullable: true })
  responseStatus: number;

  @Column({ name: 'response_time_ms', nullable: true })
  responseTimeMs: number;

  @Column({ name: 'is_success', default: false })
  isSuccess: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
