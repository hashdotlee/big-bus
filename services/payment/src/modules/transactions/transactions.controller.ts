import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionStatus } from '../../database/entities/transaction.entity';

@ApiTags('transactions')
@Controller('transactions')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is integrated
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: TransactionStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.transactionsService.findAll(userId, status, Number(page), Number(limit));
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  async getStatistics(@Query('userId') userId?: string) {
    return this.transactionsService.getStatistics(userId);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get transactions by booking ID' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async findByBookingId(@Param('bookingId') bookingId: string) {
    return this.transactionsService.findByBookingId(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTransactionStatusDto,
  ) {
    return this.transactionsService.updateStatus(id, updateStatusDto);
  }
}
