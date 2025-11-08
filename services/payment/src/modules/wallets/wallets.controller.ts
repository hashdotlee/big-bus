import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { UpdateWalletStatusDto } from './dto/update-wallet-status.dto';

@ApiTags('wallets')
@Controller('wallets')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is integrated
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  @ApiResponse({ status: 409, description: 'User already has a primary wallet' })
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(createWalletDto);
  }

  @Get('my-wallet')
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (temporary, will be from JWT)' })
  async getMyWallet(@Query('userId') userId: string) {
    return this.walletsService.findByUserId(userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (temporary, will be from JWT)' })
  async getBalance(@Query('userId') userId: string) {
    return this.walletsService.getBalance(userId);
  }

  @Post('top-up')
  @ApiOperation({ summary: 'Top up wallet' })
  @ApiResponse({ status: 201, description: 'Top-up transaction created' })
  @ApiResponse({ status: 400, description: 'Wallet is not active' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (temporary, will be from JWT)' })
  async topUp(
    @Query('userId') userId: string,
    @Body() topUpDto: TopUpWalletDto,
  ) {
    return this.walletsService.topUp(userId, topUpDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (temporary, will be from JWT)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getTransactionHistory(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.walletsService.getTransactionHistory(userId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update wallet status' })
  @ApiResponse({ status: 200, description: 'Wallet status updated successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateWalletStatusDto,
  ) {
    return this.walletsService.updateStatus(id, updateStatusDto);
  }
}
