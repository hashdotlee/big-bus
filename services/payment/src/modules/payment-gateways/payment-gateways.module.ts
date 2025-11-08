import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentGatewaysService } from './payment-gateways.service';
import { PaymentGatewaysController } from './payment-gateways.controller';
import { VNPayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZaloPayService } from './zalopay.service';
import { Transaction } from '../../database/entities/transaction.entity';
import { PaymentGatewayLog } from '../../database/entities/payment-gateway-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, PaymentGatewayLog]),
    HttpModule,
  ],
  controllers: [PaymentGatewaysController],
  providers: [
    PaymentGatewaysService,
    VNPayService,
    MomoService,
    ZaloPayService,
  ],
  exports: [PaymentGatewaysService],
})
export class PaymentGatewaysModule {}
