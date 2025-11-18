import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from '../../database/entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto, ResolveTicketDto, EscalateTicketDto, RateTicketDto } from './dto/create-ticket.dto';
import { AIService } from '../chat/ai.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly aiService: AIService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    // Generate ticket number
    const ticketNumber = this.generateTicketNumber();

    // Use AI to categorize and prioritize
    const aiAnalysis = await this.aiService.categorizeTicket(
      createTicketDto.subject,
      createTicketDto.description
    );

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      ticketNumber,
      priority: createTicketDto.priority || aiAnalysis.priority as TicketPriority,
      status: TicketStatus.OPEN,
      aiConfidence: aiAnalysis.confidence,
      aiSuggestedCategory: aiAnalysis.category,
      aiSuggestedPriority: aiAnalysis.priority,
      aiSuggestedResponse: aiAnalysis.suggestedResponse,
      history: [
        {
          timestamp: new Date(),
          action: 'created',
          userId: 'system',
          userName: 'System',
          note: `Ticket created via ${createTicketDto.source}`,
        },
      ],
    });

    // Set due date based on priority
    ticket.dueDate = this.calculateDueDate(ticket.priority);

    return await this.ticketRepository.save(ticket);
  }

  async findAll(filters?: {
    customerId?: string;
    assignedAgentId?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: Ticket[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepository.createQueryBuilder('ticket');

    if (filters?.customerId) {
      queryBuilder.andWhere('ticket.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.assignedAgentId) {
      queryBuilder.andWhere('ticket.assignedAgentId = :assignedAgentId', { assignedAgentId: filters.assignedAgentId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('ticket.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('ticket.priority = :priority', { priority: filters.priority });
    }

    if (filters?.category) {
      queryBuilder.andWhere('ticket.category = :category', { category: filters.category });
    }

    if (filters?.source) {
      queryBuilder.andWhere('ticket.source = :source', { source: filters.source });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('ticket.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('ticket.createdAt <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('ticket.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByTicketNumber(ticketNumber: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { ticketNumber } });

    if (!ticket) {
      throw new NotFoundException(`Ticket with number ${ticketNumber} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    // Track changes in history
    const changes = [];
    Object.keys(updateTicketDto).forEach(key => {
      if (ticket[key] !== updateTicketDto[key]) {
        changes.push({
          timestamp: new Date(),
          action: 'updated',
          userId: 'system',
          userName: 'System',
          oldValue: ticket[key],
          newValue: updateTicketDto[key],
          note: `Updated ${key}`,
        });
      }
    });

    ticket.history = [...ticket.history, ...changes];

    Object.assign(ticket, updateTicketDto);

    return await this.ticketRepository.save(ticket);
  }

  async assign(assignTicketDto: AssignTicketDto): Promise<Ticket> {
    const { ticketId, agentId, agentName, team } = assignTicketDto;
    const ticket = await this.findOne(ticketId);

    ticket.assignedAgentId = agentId;
    ticket.assignedAgentName = agentName;
    if (team) {
      ticket.assignedTeam = team;
    }
    ticket.assignedAt = new Date();

    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }

    ticket.history.push({
      timestamp: new Date(),
      action: 'assigned',
      userId: agentId,
      userName: agentName,
      note: `Ticket assigned to ${agentName}${team ? ` (${team})` : ''}`,
    });

    return await this.ticketRepository.save(ticket);
  }

  async resolve(resolveTicketDto: ResolveTicketDto): Promise<Ticket> {
    const { ticketId, resolution, agentId } = resolveTicketDto;
    const ticket = await this.findOne(ticketId);

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolution = resolution;
    ticket.resolvedAt = new Date();

    if (!ticket.firstResponseAt) {
      ticket.firstResponseAt = ticket.resolvedAt;
      const responseTime = (ticket.firstResponseAt.getTime() - ticket.createdAt.getTime()) / 1000;
      ticket.responseTimeSeconds = Math.round(responseTime);
    }

    const resolutionTime = (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 1000;
    ticket.resolutionTimeSeconds = Math.round(resolutionTime);

    ticket.history.push({
      timestamp: new Date(),
      action: 'resolved',
      userId: agentId || 'system',
      userName: ticket.assignedAgentName || 'System',
      note: 'Ticket resolved',
    });

    return await this.ticketRepository.save(ticket);
  }

  async close(id: string, userId?: string, userName?: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    ticket.status = TicketStatus.CLOSED;
    ticket.closedAt = new Date();

    ticket.history.push({
      timestamp: new Date(),
      action: 'closed',
      userId: userId || 'system',
      userName: userName || 'System',
      note: 'Ticket closed',
    });

    return await this.ticketRepository.save(ticket);
  }

  async escalate(escalateTicketDto: EscalateTicketDto): Promise<Ticket> {
    const { ticketId, reason, escalatedTo } = escalateTicketDto;
    const ticket = await this.findOne(ticketId);

    ticket.isEscalated = true;
    ticket.escalationReason = reason;
    ticket.priority = this.increasePriority(ticket.priority);

    ticket.history.push({
      timestamp: new Date(),
      action: 'escalated',
      userId: 'system',
      userName: 'System',
      note: `Ticket escalated${escalatedTo ? ` to ${escalatedTo}` : ''}: ${reason}`,
    });

    return await this.ticketRepository.save(ticket);
  }

  async rate(rateTicketDto: RateTicketDto): Promise<Ticket> {
    const { ticketId, rating, feedback } = rateTicketDto;
    const ticket = await this.findOne(ticketId);

    if (rating !== undefined) {
      ticket.customerSatisfactionRating = rating;
    }

    if (feedback) {
      ticket.customerFeedback = feedback;
    }

    ticket.history.push({
      timestamp: new Date(),
      action: 'rated',
      userId: ticket.customerId || 'customer',
      userName: ticket.customerName || 'Customer',
      note: `Rating: ${rating}/5${feedback ? ` - ${feedback}` : ''}`,
    });

    return await this.ticketRepository.save(ticket);
  }

  async getTicketStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    agentId?: string;
  }): Promise<any> {
    const queryBuilder = this.ticketRepository.createQueryBuilder('ticket');

    if (filters?.startDate) {
      queryBuilder.andWhere('ticket.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('ticket.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.agentId) {
      queryBuilder.andWhere('ticket.assignedAgentId = :agentId', { agentId: filters.agentId });
    }

    const tickets = await queryBuilder.getMany();

    const stats = {
      totalTickets: tickets.length,
      byStatus: {} as Record<TicketStatus, number>,
      byPriority: {} as Record<TicketPriority, number>,
      byCategory: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      averageResponseTime: 0,
      averageResolutionTime: 0,
      averageSatisfactionRating: 0,
      escalationRate: 0,
    };

    // Initialize counters
    Object.values(TicketStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(TicketPriority).forEach(priority => {
      stats.byPriority[priority] = 0;
    });

    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let totalResolutionTime = 0;
    let resolutionTimeCount = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let escalatedCount = 0;

    tickets.forEach(ticket => {
      stats.byStatus[ticket.status]++;
      stats.byPriority[ticket.priority]++;
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
      stats.bySource[ticket.source] = (stats.bySource[ticket.source] || 0) + 1;

      if (ticket.responseTimeSeconds) {
        totalResponseTime += ticket.responseTimeSeconds;
        responseTimeCount++;
      }

      if (ticket.resolutionTimeSeconds) {
        totalResolutionTime += ticket.resolutionTimeSeconds;
        resolutionTimeCount++;
      }

      if (ticket.customerSatisfactionRating) {
        totalRating += ticket.customerSatisfactionRating;
        ratingCount++;
      }

      if (ticket.isEscalated) {
        escalatedCount++;
      }
    });

    stats.averageResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;
    stats.averageResolutionTime = resolutionTimeCount > 0 ? Math.round(totalResolutionTime / resolutionTimeCount) : 0;
    stats.averageSatisfactionRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(2)) : 0;
    stats.escalationRate = tickets.length > 0 ? Number(((escalatedCount / tickets.length) * 100).toFixed(2)) : 0;

    return stats;
  }

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  private calculateDueDate(priority: TicketPriority): Date {
    const now = new Date();
    let hoursToAdd = 48; // Default: 48 hours

    switch (priority) {
      case TicketPriority.CRITICAL:
        hoursToAdd = 4;
        break;
      case TicketPriority.URGENT:
        hoursToAdd = 8;
        break;
      case TicketPriority.HIGH:
        hoursToAdd = 24;
        break;
      case TicketPriority.MEDIUM:
        hoursToAdd = 48;
        break;
      case TicketPriority.LOW:
        hoursToAdd = 72;
        break;
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  private increasePriority(currentPriority: TicketPriority): TicketPriority {
    const priorities = [
      TicketPriority.LOW,
      TicketPriority.MEDIUM,
      TicketPriority.HIGH,
      TicketPriority.URGENT,
      TicketPriority.CRITICAL,
    ];

    const currentIndex = priorities.indexOf(currentPriority);
    if (currentIndex < priorities.length - 1) {
      return priorities[currentIndex + 1];
    }

    return currentPriority;
  }
}
