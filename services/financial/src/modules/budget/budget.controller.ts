import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/budget.dto';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async create(@Body() dto: CreateBudgetDto) {
    return await this.budgetService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.budgetService.findAll();
  }

  @Post(':id/update-actuals')
  async updateActuals(@Param('id') id: string) {
    return await this.budgetService.updateActuals(id);
  }
}
