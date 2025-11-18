import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationStatus } from '../../database/entities/conversation.entity';
import { Message, MessageRole } from '../../database/entities/message.entity';
import { CreateConversationDto, SendMessageDto, RateConversationDto } from './dto/create-conversation.dto';
import { AIService } from './ai.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly aiService: AIService,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      ...createConversationDto,
      status: ConversationStatus.ACTIVE,
      messageCount: 0,
      aiMessageCount: 0,
      humanMessageCount: 0,
    });

    return await this.conversationRepository.save(conversation);
  }

  async findAll(filters?: {
    customerId?: string;
    status?: ConversationStatus;
    channel?: string;
    assignedAgentId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: Conversation[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.conversationRepository.createQueryBuilder('conversation');

    if (filters?.customerId) {
      queryBuilder.andWhere('conversation.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('conversation.status = :status', { status: filters.status });
    }

    if (filters?.channel) {
      queryBuilder.andWhere('conversation.channel = :channel', { channel: filters.channel });
    }

    if (filters?.assignedAgentId) {
      queryBuilder.andWhere('conversation.assignedAgentId = :assignedAgentId', { assignedAgentId: filters.assignedAgentId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('conversation.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('conversation.createdAt <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('conversation.updatedAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<{ message: Message; aiResponse?: Message }> {
    const { conversationId, content, userId, userName } = sendMessageDto;

    const conversation = await this.findOne(conversationId);

    // Create user message
    const userMessage = this.messageRepository.create({
      conversationId,
      role: MessageRole.USER,
      content,
      userId,
      userName,
    });

    await this.messageRepository.save(userMessage);

    // Update conversation counters
    conversation.messageCount += 1;
    conversation.humanMessageCount += 1;

    // Analyze sentiment and intent
    const [sentiment, intent] = await Promise.all([
      this.aiService.analyzeSentiment(content),
      this.aiService.detectIntent(content),
    ]);

    userMessage.sentiment = sentiment.sentiment;
    userMessage.sentimentScore = sentiment.score;
    userMessage.intent = intent.intent;
    userMessage.entities = intent.entities;
    await this.messageRepository.save(userMessage);

    // Update conversation sentiment
    conversation.sentiment = sentiment.sentiment;
    conversation.sentimentScore = sentiment.score;

    // Get conversation history for context
    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: 10, // Last 10 messages for context
    });

    // Generate AI response
    const chatHistory = messages.map(m => ({
      role: m.role === MessageRole.ASSISTANT ? 'assistant' : 'user',
      content: m.content,
    }));

    const aiResult = await this.aiService.generateResponse(chatHistory, {
      customerName: conversation.customerName,
      conversationHistory: messages,
    });

    // Create AI message
    const aiMessage = this.messageRepository.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: aiResult.response,
      isAiGenerated: true,
      aiModel: aiResult.model,
      aiTokensUsed: aiResult.tokensUsed,
      confidenceScore: aiResult.confidence,
    });

    await this.messageRepository.save(aiMessage);

    // Update conversation counters
    conversation.messageCount += 1;
    conversation.aiMessageCount += 1;

    if (!conversation.firstResponseAt) {
      conversation.firstResponseAt = new Date();
      const responseTime = (conversation.firstResponseAt.getTime() - conversation.createdAt.getTime()) / 1000;
      conversation.responseTimeSeconds = Math.round(responseTime);
    }

    await this.conversationRepository.save(conversation);

    return {
      message: userMessage,
      aiResponse: aiMessage,
    };
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async assignToAgent(conversationId: string, agentId: string, agentName: string): Promise<Conversation> {
    const conversation = await this.findOne(conversationId);

    conversation.assignedAgentId = agentId;
    conversation.assignedAgentName = agentName;
    conversation.status = ConversationStatus.ESCALATED;

    return await this.conversationRepository.save(conversation);
  }

  async resolveConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.findOne(conversationId);

    conversation.status = ConversationStatus.RESOLVED;
    conversation.resolvedAt = new Date();

    const resolutionTime = (conversation.resolvedAt.getTime() - conversation.createdAt.getTime()) / 1000;
    conversation.resolutionTimeSeconds = Math.round(resolutionTime);

    // Generate summary
    const messages = await this.getMessages(conversationId);
    const summary = await this.aiService.summarizeConversation(messages);
    conversation.summary = summary;

    return await this.conversationRepository.save(conversation);
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.findOne(conversationId);

    conversation.status = ConversationStatus.CLOSED;
    conversation.closedAt = new Date();

    return await this.conversationRepository.save(conversation);
  }

  async rateConversation(rateConversationDto: RateConversationDto): Promise<Conversation> {
    const { conversationId, rating, feedback } = rateConversationDto;
    const conversation = await this.findOne(conversationId);

    if (rating !== undefined) {
      conversation.customerSatisfactionRating = rating;
    }

    if (feedback) {
      conversation.customerFeedback = feedback;
    }

    return await this.conversationRepository.save(conversation);
  }

  async getConversationStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    agentId?: string;
  }): Promise<any> {
    const queryBuilder = this.conversationRepository.createQueryBuilder('conversation');

    if (filters?.startDate) {
      queryBuilder.andWhere('conversation.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('conversation.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.agentId) {
      queryBuilder.andWhere('conversation.assignedAgentId = :agentId', { agentId: filters.agentId });
    }

    const conversations = await queryBuilder.getMany();

    const stats = {
      totalConversations: conversations.length,
      byStatus: {} as Record<ConversationStatus, number>,
      byChannel: {} as Record<string, number>,
      bySentiment: {
        positive: 0,
        negative: 0,
        neutral: 0,
      },
      averageResponseTime: 0,
      averageResolutionTime: 0,
      averageSatisfactionRating: 0,
      aiHandledPercentage: 0,
    };

    // Initialize counters
    Object.values(ConversationStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });

    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let totalResolutionTime = 0;
    let resolutionTimeCount = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let aiOnlyConversations = 0;

    conversations.forEach(conv => {
      stats.byStatus[conv.status]++;
      stats.byChannel[conv.channel] = (stats.byChannel[conv.channel] || 0) + 1;

      if (conv.sentiment) {
        stats.bySentiment[conv.sentiment] = (stats.bySentiment[conv.sentiment] || 0) + 1;
      }

      if (conv.responseTimeSeconds) {
        totalResponseTime += conv.responseTimeSeconds;
        responseTimeCount++;
      }

      if (conv.resolutionTimeSeconds) {
        totalResolutionTime += conv.resolutionTimeSeconds;
        resolutionTimeCount++;
      }

      if (conv.customerSatisfactionRating) {
        totalRating += conv.customerSatisfactionRating;
        ratingCount++;
      }

      if (conv.aiMessageCount > 0 && conv.humanMessageCount === conv.aiMessageCount + conv.messageCount - conv.aiMessageCount) {
        aiOnlyConversations++;
      }
    });

    stats.averageResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;
    stats.averageResolutionTime = resolutionTimeCount > 0 ? Math.round(totalResolutionTime / resolutionTimeCount) : 0;
    stats.averageSatisfactionRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(2)) : 0;
    stats.aiHandledPercentage = conversations.length > 0 ? Number(((aiOnlyConversations / conversations.length) * 100).toFixed(2)) : 0;

    return stats;
  }
}
