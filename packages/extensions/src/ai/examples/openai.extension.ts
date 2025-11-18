import {
  BaseAIServiceExtension,
  AIServiceType,
  ICustomerSupportExtension,
  ChatRequest,
  ChatResponse,
  ChatMessage,
} from '../ai-service.extension';

/**
 * OpenAI ChatGPT Extension
 * Customer support chatbot using OpenAI's GPT models
 */
export class OpenAIChatExtension
  extends BaseAIServiceExtension
  implements ICustomerSupportExtension
{
  readonly id = 'openai-chat';
  readonly name = 'OpenAI ChatGPT';
  readonly version = '1.0.0';
  description = 'Customer support chatbot powered by OpenAI GPT';
  author = 'Big Bus';

  private systemPrompt = `You are a helpful customer support assistant for Big Bus, a bus booking platform.
You can help customers with:
- Booking tickets
- Finding routes and schedules
- Payment issues
- Cancellations and refunds
- General inquiries

Be friendly, professional, and concise in your responses.`;

  getSupportedServiceTypes(): AIServiceType[] {
    return [
      AIServiceType.CHATBOT,
      AIServiceType.SENTIMENT_ANALYSIS,
      AIServiceType.SUMMARIZATION,
      AIServiceType.TRANSLATION,
    ];
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // In a real implementation, call OpenAI API
      // const OpenAI = require('openai');
      // const openai = new OpenAI({ apiKey: this.modelConfig.apiKey });
      // const completion = await openai.chat.completions.create({
      //   model: this.modelConfig.modelName || 'gpt-4',
      //   messages: [
      //     { role: 'system', content: this.systemPrompt },
      //     ...request.messages,
      //   ],
      //   max_tokens: request.maxTokens || this.modelConfig.maxTokens,
      //   temperature: request.temperature || this.modelConfig.temperature || 0.7,
      // });

      // Mock response
      const userMessage = request.messages[request.messages.length - 1];
      let responseContent = 'How can I help you with your bus booking today?';

      // Simple keyword-based responses for demo
      const userContent = userMessage.content.toLowerCase();
      if (userContent.includes('book') || userContent.includes('ticket')) {
        responseContent =
          "I'd be happy to help you book a ticket! Could you please tell me your departure city, destination, and preferred travel date?";
      } else if (userContent.includes('cancel') || userContent.includes('refund')) {
        responseContent =
          'I understand you need help with a cancellation or refund. Please provide your booking reference number, and I will assist you with the process.';
      } else if (userContent.includes('payment')) {
        responseContent =
          'For payment issues, I can help you with: payment methods, transaction status, or failed payments. Which one would you like to discuss?';
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
      };

      return {
        message: assistantMessage,
        finishReason: 'stop',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        metadata: {
          model: 'gpt-4',
          sessionId: request.sessionId,
        },
      };
    } catch (error) {
      throw new Error(`OpenAI chat error: ${error.message}`);
    }
  }

  async getSuggestedResponses(
    query: string,
    context?: Record<string, any>,
  ): Promise<string[]> {
    // In a real implementation, use GPT to generate suggested responses
    return [
      'How can I help you today?',
      'Would you like to book a ticket?',
      'Do you need help with an existing booking?',
    ];
  }

  async analyzeIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    entities?: Record<string, any>;
  }> {
    // Simple keyword-based intent detection for demo
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('book') || lowerMessage.includes('ticket')) {
      return {
        intent: 'book_ticket',
        confidence: 0.9,
        entities: {},
      };
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      return {
        intent: 'cancel_booking',
        confidence: 0.85,
        entities: {},
      };
    } else if (lowerMessage.includes('payment')) {
      return {
        intent: 'payment_inquiry',
        confidence: 0.8,
        entities: {},
      };
    } else if (lowerMessage.includes('route') || lowerMessage.includes('schedule')) {
      return {
        intent: 'route_inquiry',
        confidence: 0.85,
        entities: {},
      };
    }

    return {
      intent: 'general_inquiry',
      confidence: 0.5,
      entities: {},
    };
  }

  async escalateToHuman(sessionId: string, reason: string): Promise<void> {
    // In a real implementation, notify human agents
    console.log(`Escalating session ${sessionId} to human agent. Reason: ${reason}`);
    // Could send to a ticketing system, notify via webhook, etc.
  }
}
