import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { Message } from '../../database/entities/message.entity';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBase>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. AI features will be limited.');
    } else {
      this.openai = new OpenAI({ apiKey });
    }

    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview');
  }

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    context?: {
      customerName?: string;
      conversationHistory?: Message[];
      relatedBookingId?: string;
    }
  ): Promise<{
    response: string;
    tokensUsed: number;
    model: string;
    confidence: number;
  }> {
    if (!this.openai) {
      return {
        response: "I'm sorry, but AI support is currently unavailable. Please contact our support team directly.",
        tokensUsed: 0,
        model: 'none',
        confidence: 0,
      };
    }

    try {
      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(context);

      // Search knowledge base for relevant information
      const relevantArticles = await this.searchKnowledgeBase(messages[messages.length - 1]?.content || '');

      let enhancedSystemPrompt = systemPrompt;
      if (relevantArticles.length > 0) {
        enhancedSystemPrompt += '\n\nRelevant knowledge base articles:\n';
        relevantArticles.forEach((article, index) => {
          enhancedSystemPrompt += `\n${index + 1}. ${article.title}\n${article.summary || article.content.substring(0, 300)}\n`;
        });
      }

      const chatMessages: ChatMessage[] = [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages.map(m => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content
        }))
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Update knowledge base usage statistics
      if (relevantArticles.length > 0) {
        await this.updateKnowledgeBaseUsage(relevantArticles.map(a => a.id));
      }

      return {
        response,
        tokensUsed,
        model: this.model,
        confidence: this.calculateConfidence(completion),
      };
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`, error.stack);
      return {
        response: "I apologize, but I encountered an error processing your request. Please try again or contact our support team.",
        tokensUsed: 0,
        model: this.model,
        confidence: 0,
      };
    }
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: string;
    score: number;
    confidence: number;
  }> {
    if (!this.openai) {
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the following text. Respond with only a JSON object containing: sentiment (positive/negative/neutral), score (-1 to 1), and confidence (0 to 1).'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const result = JSON.parse(response);
        return {
          sentiment: result.sentiment || 'neutral',
          score: result.score || 0,
          confidence: result.confidence || 0.5,
        };
      }
    } catch (error) {
      this.logger.error(`Error analyzing sentiment: ${error.message}`);
    }

    return { sentiment: 'neutral', score: 0, confidence: 0 };
  }

  async detectIntent(text: string): Promise<{
    intent: string;
    confidence: number;
    entities: Array<{ type: string; value: string; confidence: number }>;
  }> {
    if (!this.openai) {
      return { intent: 'general_inquiry', confidence: 0, entities: [] };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the customer message and determine the intent. Common intents include: booking_inquiry, payment_issue, cancellation_request, refund_request, route_information, schedule_inquiry, complaint, feedback, account_help, marketplace_inquiry, technical_issue, general_inquiry. Also extract entities like dates, booking IDs, amounts, locations. Respond with only a JSON object containing: intent, confidence (0 to 1), and entities array.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const result = JSON.parse(response);
        return {
          intent: result.intent || 'general_inquiry',
          confidence: result.confidence || 0.5,
          entities: result.entities || [],
        };
      }
    } catch (error) {
      this.logger.error(`Error detecting intent: ${error.message}`);
    }

    return { intent: 'general_inquiry', confidence: 0, entities: [] };
  }

  async categorizeTicket(subject: string, description: string): Promise<{
    category: string;
    priority: string;
    suggestedResponse: string;
    confidence: number;
  }> {
    if (!this.openai) {
      return {
        category: 'other',
        priority: 'medium',
        suggestedResponse: '',
        confidence: 0,
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the support ticket and provide categorization. Categories: booking, payment, cancellation, refund, route_info, schedule, lost_found, complaint, feedback, technical, account, marketplace, other. Priorities: low, medium, high, urgent, critical. Respond with only a JSON object containing: category, priority, suggestedResponse (brief helpful response), confidence (0 to 1).`
          },
          {
            role: 'user',
            content: `Subject: ${subject}\n\nDescription: ${description}`
          }
        ],
        temperature: 0.4,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const result = JSON.parse(response);
        return {
          category: result.category || 'other',
          priority: result.priority || 'medium',
          suggestedResponse: result.suggestedResponse || '',
          confidence: result.confidence || 0.5,
        };
      }
    } catch (error) {
      this.logger.error(`Error categorizing ticket: ${error.message}`);
    }

    return {
      category: 'other',
      priority: 'medium',
      suggestedResponse: '',
      confidence: 0,
    };
  }

  async summarizeConversation(messages: Message[]): Promise<string> {
    if (!this.openai || messages.length === 0) {
      return '';
    }

    try {
      const conversationText = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize the following customer support conversation in 2-3 sentences. Focus on the main issue and resolution if any.'
          },
          {
            role: 'user',
            content: conversationText
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error(`Error summarizing conversation: ${error.message}`);
      return '';
    }
  }

  private buildSystemPrompt(context?: any): string {
    let prompt = `You are a helpful customer support assistant for Big Bus, a bus booking and transportation service.

Your responsibilities:
- Answer customer questions about bookings, routes, schedules, and services
- Help with payment and refund inquiries
- Provide information about the marketplace (products available on buses)
- Maintain a friendly, professional, and empathetic tone
- If you don't know the answer, admit it and offer to escalate to a human agent
- Keep responses concise but helpful

Important policies:
- Refunds are available up to 24 hours before departure
- Bookings can be modified up to 12 hours before departure
- Lost items should be reported within 48 hours
- Marketplace orders can be placed during the journey`;

    if (context?.customerName) {
      prompt += `\n\nCustomer name: ${context.customerName}`;
    }

    if (context?.relatedBookingId) {
      prompt += `\n\nRelated booking ID: ${context.relatedBookingId}`;
    }

    return prompt;
  }

  private async searchKnowledgeBase(query: string, limit: number = 3): Promise<KnowledgeBase[]> {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      // Simple keyword search - in production, you'd want to use vector search or full-text search
      const articles = await this.knowledgeBaseRepository
        .createQueryBuilder('kb')
        .where('kb.status = :status', { status: 'published' })
        .andWhere(
          '(kb.title ILIKE :query OR kb.content ILIKE :query OR kb.keywords && :keywordsArray)',
          {
            query: `%${query}%`,
            keywordsArray: query.toLowerCase().split(' '),
          }
        )
        .orderBy('kb.helpfulnessScore', 'DESC')
        .limit(limit)
        .getMany();

      return articles;
    } catch (error) {
      this.logger.error(`Error searching knowledge base: ${error.message}`);
      return [];
    }
  }

  private async updateKnowledgeBaseUsage(articleIds: string[]): Promise<void> {
    try {
      await this.knowledgeBaseRepository
        .createQueryBuilder()
        .update(KnowledgeBase)
        .set({ usedByAiCount: () => '"usedByAiCount" + 1' })
        .whereInIds(articleIds)
        .execute();
    } catch (error) {
      this.logger.error(`Error updating knowledge base usage: ${error.message}`);
    }
  }

  private calculateConfidence(completion: any): number {
    // Simple confidence calculation based on response characteristics
    // In production, you might want more sophisticated logic
    const finishReason = completion.choices[0]?.finish_reason;
    if (finishReason === 'stop') {
      return 0.8;
    } else if (finishReason === 'length') {
      return 0.6;
    }
    return 0.5;
  }
}
