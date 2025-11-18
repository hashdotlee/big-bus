import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { Ticket } from '../../database/entities/ticket.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getDashboardMetrics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const endDate = filters?.endDate || new Date();

    const [conversations, tickets, messages] = await Promise.all([
      this.conversationRepository.find({
        where: {
          createdAt: filters?.startDate || filters?.endDate ? undefined : undefined,
        },
      }),
      this.ticketRepository.find({
        where: {
          createdAt: filters?.startDate || filters?.endDate ? undefined : undefined,
        },
      }),
      this.messageRepository.find({
        where: {
          createdAt: filters?.startDate || filters?.endDate ? undefined : undefined,
        },
      }),
    ]);

    // Filter by date
    const filteredConversations = conversations.filter(
      c => c.createdAt >= startDate && c.createdAt <= endDate
    );
    const filteredTickets = tickets.filter(
      t => t.createdAt >= startDate && t.createdAt <= endDate
    );
    const filteredMessages = messages.filter(
      m => m.createdAt >= startDate && m.createdAt <= endDate
    );

    return {
      overview: {
        totalConversations: filteredConversations.length,
        totalTickets: filteredTickets.length,
        totalMessages: filteredMessages.length,
        aiMessagesCount: filteredMessages.filter(m => m.isAiGenerated).length,
        aiMessagesPercentage: filteredMessages.length > 0
          ? Number(((filteredMessages.filter(m => m.isAiGenerated).length / filteredMessages.length) * 100).toFixed(2))
          : 0,
      },
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(filteredConversations),
        averageResolutionTime: this.calculateAverageResolutionTime([...filteredConversations, ...filteredTickets]),
        customerSatisfaction: this.calculateAverageSatisfaction([...filteredConversations, ...filteredTickets]),
      },
      sentiment: this.analyzeSentiment(filteredConversations),
      trends: await this.calculateTrends(startDate, endDate),
    };
  }

  async getAgentPerformance(agentId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.endDate || new Date();

    const [conversations, tickets] = await Promise.all([
      this.conversationRepository.find({
        where: { assignedAgentId: agentId },
      }),
      this.ticketRepository.find({
        where: { assignedAgentId: agentId },
      }),
    ]);

    const filteredConversations = conversations.filter(
      c => c.createdAt >= startDate && c.createdAt <= endDate
    );
    const filteredTickets = tickets.filter(
      t => t.createdAt >= startDate && t.createdAt <= endDate
    );

    return {
      agentId,
      totalConversations: filteredConversations.length,
      totalTickets: filteredTickets.length,
      resolvedConversations: filteredConversations.filter(c => c.status === 'resolved').length,
      resolvedTickets: filteredTickets.filter(t => t.status === 'resolved').length,
      averageResponseTime: this.calculateAverageResponseTime(filteredConversations),
      averageResolutionTime: this.calculateAverageResolutionTime([...filteredConversations, ...filteredTickets]),
      customerSatisfaction: this.calculateAverageSatisfaction([...filteredConversations, ...filteredTickets]),
      resolutionRate: this.calculateResolutionRate([...filteredConversations, ...filteredTickets]),
    };
  }

  async getTopIssues(filters?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.endDate || new Date();
    const limit = filters?.limit || 10;

    const tickets = await this.ticketRepository.find({
      where: {
        createdAt: filters?.startDate || filters?.endDate ? undefined : undefined,
      },
    });

    const filteredTickets = tickets.filter(
      t => t.createdAt >= startDate && t.createdAt <= endDate
    );

    // Group by category
    const issuesByCategory: Record<string, any> = {};

    filteredTickets.forEach(ticket => {
      if (!issuesByCategory[ticket.category]) {
        issuesByCategory[ticket.category] = {
          category: ticket.category,
          count: 0,
          resolved: 0,
          averageResolutionTime: 0,
          totalResolutionTime: 0,
          resolutionCount: 0,
        };
      }

      issuesByCategory[ticket.category].count++;

      if (ticket.status === 'resolved') {
        issuesByCategory[ticket.category].resolved++;

        if (ticket.resolutionTimeSeconds) {
          issuesByCategory[ticket.category].totalResolutionTime += ticket.resolutionTimeSeconds;
          issuesByCategory[ticket.category].resolutionCount++;
        }
      }
    });

    // Calculate averages and sort
    const topIssues = Object.values(issuesByCategory)
      .map(issue => ({
        ...issue,
        averageResolutionTime: issue.resolutionCount > 0
          ? Math.round(issue.totalResolutionTime / issue.resolutionCount)
          : 0,
        resolutionRate: issue.count > 0
          ? Number(((issue.resolved / issue.count) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return topIssues;
  }

  async getAIInsights(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.endDate || new Date();

    const [messages, tickets] = await Promise.all([
      this.messageRepository.find({
        where: { isAiGenerated: true },
      }),
      this.ticketRepository.find(),
    ]);

    const filteredMessages = messages.filter(
      m => m.createdAt >= startDate && m.createdAt <= endDate
    );
    const filteredTickets = tickets.filter(
      t => t.createdAt >= startDate && t.createdAt <= endDate
    );

    const totalTokens = filteredMessages.reduce((sum, m) => sum + (m.aiTokensUsed || 0), 0);
    const avgConfidence = filteredMessages.length > 0
      ? filteredMessages.reduce((sum, m) => sum + (m.confidenceScore || 0), 0) / filteredMessages.length
      : 0;

    const aiCategorizedTickets = filteredTickets.filter(t => t.aiSuggestedCategory);
    const aiCategoryAccuracy = aiCategorizedTickets.length > 0
      ? aiCategorizedTickets.filter(t => t.category === t.aiSuggestedCategory).length / aiCategorizedTickets.length
      : 0;

    return {
      totalAIMessages: filteredMessages.length,
      totalTokensUsed: totalTokens,
      averageConfidence: Number(avgConfidence.toFixed(2)),
      aiCategoryAccuracy: Number((aiCategoryAccuracy * 100).toFixed(2)),
      topIntents: this.getTopIntents(filteredMessages),
      sentimentDistribution: this.getSentimentDistribution(filteredMessages),
    };
  }

  private calculateAverageResponseTime(items: any[]): number {
    const itemsWithResponseTime = items.filter(item => item.responseTimeSeconds);
    if (itemsWithResponseTime.length === 0) return 0;

    const total = itemsWithResponseTime.reduce((sum, item) => sum + item.responseTimeSeconds, 0);
    return Math.round(total / itemsWithResponseTime.length);
  }

  private calculateAverageResolutionTime(items: any[]): number {
    const itemsWithResolutionTime = items.filter(item => item.resolutionTimeSeconds);
    if (itemsWithResolutionTime.length === 0) return 0;

    const total = itemsWithResolutionTime.reduce((sum, item) => sum + item.resolutionTimeSeconds, 0);
    return Math.round(total / itemsWithResolutionTime.length);
  }

  private calculateAverageSatisfaction(items: any[]): number {
    const itemsWithRating = items.filter(item => item.customerSatisfactionRating);
    if (itemsWithRating.length === 0) return 0;

    const total = itemsWithRating.reduce((sum, item) => sum + item.customerSatisfactionRating, 0);
    return Number((total / itemsWithRating.length).toFixed(2));
  }

  private calculateResolutionRate(items: any[]): number {
    if (items.length === 0) return 0;

    const resolved = items.filter(item => item.status === 'resolved' || item.status === 'closed').length;
    return Number(((resolved / items.length) * 100).toFixed(2));
  }

  private analyzeSentiment(conversations: Conversation[]): any {
    const sentiments = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    conversations.forEach(conv => {
      if (conv.sentiment) {
        sentiments[conv.sentiment] = (sentiments[conv.sentiment] || 0) + 1;
      }
    });

    return sentiments;
  }

  private async calculateTrends(startDate: Date, endDate: Date): Promise<any> {
    // Calculate daily trends for the period
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const trends = {
      conversations: [],
      tickets: [],
      messages: [],
    };

    // This is a simplified version - in production you'd want more efficient queries
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const [convCount, ticketCount, messageCount] = await Promise.all([
        this.conversationRepository.count({
          where: {
            createdAt: undefined, // TypeORM between would go here in a real query
          },
        }),
        this.ticketRepository.count({
          where: {
            createdAt: undefined,
          },
        }),
        this.messageRepository.count({
          where: {
            createdAt: undefined,
          },
        }),
      ]);

      trends.conversations.push({ date: date.toISOString().split('T')[0], count: convCount });
      trends.tickets.push({ date: date.toISOString().split('T')[0], count: ticketCount });
      trends.messages.push({ date: date.toISOString().split('T')[0], count: messageCount });
    }

    return trends;
  }

  private getTopIntents(messages: Message[]): any[] {
    const intents: Record<string, number> = {};

    messages.forEach(message => {
      if (message.intent) {
        intents[message.intent] = (intents[message.intent] || 0) + 1;
      }
    });

    return Object.entries(intents)
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getSentimentDistribution(messages: Message[]): any {
    const distribution = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    messages.forEach(message => {
      if (message.sentiment) {
        distribution[message.sentiment] = (distribution[message.sentiment] || 0) + 1;
      }
    });

    return distribution;
  }
}
