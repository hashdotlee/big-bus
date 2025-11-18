import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { TicketStatus, TicketCategory, TicketPriority } from './support.entity';

class JwtAuthGuard {}

@ApiTags('Customer Support')
@Controller('support')
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a support ticket' })
  async createTicket(
    @Request() req: any,
    @Body()
    body: {
      subject: string;
      description: string;
      category?: TicketCategory;
      priority?: TicketPriority;
      bookingId?: string;
    },
  ) {
    const ticket = await this.supportService.createTicket({
      userId: req.user.sub,
      ...body,
    });

    return { success: true, data: ticket };
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my support tickets' })
  async getMyTickets(@Request() req: any) {
    const tickets = await this.supportService.getUserTickets(req.user.sub);
    return { success: true, data: tickets };
  }

  @Get('tickets/:ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get ticket details with messages' })
  async getTicket(@Request() req: any, @Param('ticketId') ticketId: string) {
    const result = await this.supportService.getTicket(ticketId, req.user.sub);
    return { success: true, data: result };
  }

  @Post('tickets/:ticketId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add message to ticket' })
  async addMessage(
    @Request() req: any,
    @Param('ticketId') ticketId: string,
    @Body() body: { message: string },
  ) {
    const message = await this.supportService.addMessage(
      ticketId,
      req.user.sub,
      body.message,
      false,
    );

    return { success: true, data: message };
  }

  @Patch('tickets/:ticketId/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update ticket status' })
  async updateStatus(
    @Param('ticketId') ticketId: string,
    @Body() body: { status: TicketStatus },
  ) {
    await this.supportService.updateTicketStatus(ticketId, body.status);
    return { success: true, message: 'Ticket status updated' };
  }
}
