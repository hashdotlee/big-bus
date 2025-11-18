import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupportTicket,
  SupportMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from './support.entity';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private readonly messageRepository: Repository<SupportMessage>,
  ) {}

  /**
   * Create a new support ticket
   */
  async createTicket(data: {
    userId: string;
    subject: string;
    description: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    bookingId?: string;
  }): Promise<SupportTicket> {
    const ticket = this.ticketRepository.create({
      ...data,
      status: TicketStatus.OPEN,
    });

    await this.ticketRepository.save(ticket);

    // Create initial message
    const message = this.messageRepository.create({
      ticketId: ticket.id,
      senderId: data.userId,
      isAgent: false,
      message: data.description,
    });

    await this.messageRepository.save(message);

    this.logger.log(`Created support ticket ${ticket.id} for user ${data.userId}`);

    return ticket;
  }

  /**
   * Add message to ticket
   */
  async addMessage(
    ticketId: string,
    senderId: string,
    message: string,
    isAgent: boolean = false,
  ): Promise<SupportMessage> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const msg = this.messageRepository.create({
      ticketId,
      senderId,
      message,
      isAgent,
    });

    await this.messageRepository.save(msg);

    // Update ticket status if customer replies
    if (!isAgent && ticket.status === TicketStatus.WAITING_CUSTOMER) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketRepository.save(ticket);
    }

    return msg;
  }

  /**
   * Get ticket with messages
   */
  async getTicket(ticketId: string, userId?: string): Promise<{
    ticket: SupportTicket;
    messages: SupportMessage[];
  }> {
    const ticket = await this.ticketRepository.findOne({
      where: userId ? { id: ticketId, userId } : { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const messages = await this.messageRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });

    return { ticket, messages };
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    agentId?: string,
  ): Promise<void> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = status;

    if (status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    } else if (status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
    }

    if (agentId && status === TicketStatus.IN_PROGRESS) {
      ticket.assignedTo = agentId;
    }

    await this.ticketRepository.save(ticket);

    this.logger.log(`Updated ticket ${ticketId} status to ${status}`);
  }

  /**
   * Get open tickets (for agents)
   */
  async getOpenTickets(limit: number = 50): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: [
        { status: TicketStatus.OPEN },
        { status: TicketStatus.IN_PROGRESS },
        { status: TicketStatus.WAITING_CUSTOMER },
      ],
      order: { priority: 'DESC', createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get tickets assigned to an agent
   */
  async getAgentTickets(agentId: string): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: { assignedTo: agentId },
      order: { updatedAt: 'DESC' },
    });
  }
}
