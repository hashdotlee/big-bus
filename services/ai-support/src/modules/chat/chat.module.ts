import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ConversationService } from './conversation.service';
import { AIService } from './ai.service';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, KnowledgeBase])],
  controllers: [ChatController],
  providers: [ConversationService, AIService],
  exports: [ConversationService, AIService],
})
export class ChatModule {}
