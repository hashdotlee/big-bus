import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  AssignTicketDto,
  ResolveTicketDto,
  EscalateTicketDto,
  RateTicketDto,
} from './dto/create-ticket.dto';
import { TicketStatus, TicketPriority } from '../../database/entities/ticket.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketsService.create(createTicketDto);
  }

  @Get()
  async findAll(
    @Query('customerId') customerId?: string,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('category') category?: string,
    @Query('source') source?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (customerId) filters.customerId = customerId;
    if (assignedAgentId) filters.assignedAgentId = assignedAgentId;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (source) filters.source = source;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    return await this.ticketsService.findAll(filters);
  }

  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agentId') agentId?: string,
  ) {
    const filters: any = {};

    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (agentId) filters.agentId = agentId;

    return await this.ticketsService.getTicketStats(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ticketsService.findOne(id);
  }

  @Get('number/:ticketNumber')
  async findByTicketNumber(@Param('ticketNumber') ticketNumber: string) {
    return await this.ticketsService.findByTicketNumber(ticketNumber);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return await this.ticketsService.update(id, updateTicketDto);
  }

  @Post('assign')
  async assign(@Body() assignTicketDto: AssignTicketDto) {
    return await this.ticketsService.assign(assignTicketDto);
  }

  @Post('resolve')
  async resolve(@Body() resolveTicketDto: ResolveTicketDto) {
    return await this.ticketsService.resolve(resolveTicketDto);
  }

  @Patch(':id/close')
  async close(
    @Param('id') id: string,
    @Body() body?: { userId?: string; userName?: string }
  ) {
    return await this.ticketsService.close(id, body?.userId, body?.userName);
  }

  @Post('escalate')
  async escalate(@Body() escalateTicketDto: EscalateTicketDto) {
    return await this.ticketsService.escalate(escalateTicketDto);
  }

  @Post('rate')
  async rate(@Body() rateTicketDto: RateTicketDto) {
    return await this.ticketsService.rate(rateTicketDto);
  }
}
