import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto, SendMessageDto, RateConversationDto } from './dto/create-conversation.dto';
import { ConversationStatus } from '../../database/entities/conversation.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('conversations')
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    return await this.conversationService.createConversation(createConversationDto);
  }

  @Get('conversations')
  async getConversations(
    @Query('customerId') customerId?: string,
    @Query('status') status?: ConversationStatus,
    @Query('channel') channel?: string,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (customerId) filters.customerId = customerId;
    if (status) filters.status = status;
    if (channel) filters.channel = channel;
    if (assignedAgentId) filters.assignedAgentId = assignedAgentId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    return await this.conversationService.findAll(filters);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return await this.conversationService.findOne(id);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string; userId?: string; userName?: string }
  ) {
    const sendMessageDto: SendMessageDto = {
      conversationId: id,
      content: body.content,
      userId: body.userId,
      userName: body.userName,
    };

    return await this.conversationService.sendMessage(sendMessageDto);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string) {
    return await this.conversationService.getMessages(id);
  }

  @Patch('conversations/:id/assign')
  async assignToAgent(
    @Param('id') id: string,
    @Body() body: { agentId: string; agentName: string }
  ) {
    return await this.conversationService.assignToAgent(id, body.agentId, body.agentName);
  }

  @Patch('conversations/:id/resolve')
  async resolveConversation(@Param('id') id: string) {
    return await this.conversationService.resolveConversation(id);
  }

  @Patch('conversations/:id/close')
  async closeConversation(@Param('id') id: string) {
    return await this.conversationService.closeConversation(id);
  }

  @Post('conversations/:id/rate')
  async rateConversation(
    @Param('id') id: string,
    @Body() body: { rating?: number; feedback?: string }
  ) {
    const rateDto: RateConversationDto = {
      conversationId: id,
      rating: body.rating,
      feedback: body.feedback,
    };

    return await this.conversationService.rateConversation(rateDto);
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

    return await this.conversationService.getConversationStats(filters);
  }
}
