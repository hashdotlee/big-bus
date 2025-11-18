import { Controller, Post, Body } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { GetPersonalizedPriceDto } from './dto/pricing.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  async getPersonalizedPrice(@Body() dto: GetPersonalizedPriceDto & { basePrice: number }) {
    const { basePrice, ...priceDto } = dto;
    return await this.pricingService.getPersonalizedPrice(priceDto, basePrice);
  }
}
