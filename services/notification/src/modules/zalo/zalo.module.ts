import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZaloService } from './zalo.service';
import { ZaloController } from './zalo.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ZaloController],
  providers: [ZaloService],
  exports: [ZaloService],
})
export class ZaloModule {}
