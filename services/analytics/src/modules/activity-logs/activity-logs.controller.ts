import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ActivityLogsService } from './activity-logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogsDto } from './dto/query-logs.dto';

@ApiTags('activity-logs')
@Controller('logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs with filters' })
  async getLogs(@Query() query: QueryLogsDto) {
    return this.activityLogsService.getLogs(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity log statistics' })
  async getLogStats(@Query() query: QueryLogsDto) {
    return this.activityLogsService.getLogStats(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export activity logs to CSV' })
  async exportLogs(@Query() query: QueryLogsDto, @Res() res: Response) {
    const csv = await this.activityLogsService.exportLogs(query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
    return res.send(csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity log by ID' })
  async getLogById(@Param('id') id: string) {
    return this.activityLogsService.getLogById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity log entry' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Log entry created' })
  async createLog(@Body() dto: CreateLogDto) {
    return this.activityLogsService.createLog(dto);
  }
}
