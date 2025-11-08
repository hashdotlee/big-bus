import {
  Controller,
  Get,
  Post,
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
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { RefundStatus } from '../../database/entities/refund.entity';

@ApiTags('refunds')
@Controller('refunds')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is integrated
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Create refund request' })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (temporary, will be from JWT)' })
  create(
    @Query('userId') userId: string,
    @Body() createRefundDto: CreateRefundDto,
  ) {
    return this.refundsService.create(userId, createRefundDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all refunds' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, enum: RefundStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: RefundStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.refundsService.findAll(userId, status, Number(page), Number(limit));
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get refunds by booking ID' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully' })
  findByBookingId(@Param('bookingId') bookingId: string) {
    return this.refundsService.findByBookingId(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund by ID' })
  @ApiResponse({ status: 200, description: 'Refund retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(id);
  }

  @Patch(':id/process')
  @ApiOperation({ summary: 'Process refund' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  @ApiQuery({ name: 'processedBy', required: true, description: 'User ID of processor' })
  process(
    @Param('id') id: string,
    @Query('processedBy') processedBy: string,
    @Body() processRefundDto: ProcessRefundDto,
  ) {
    return this.refundsService.process(id, processRefundDto, processedBy);
  }
}
