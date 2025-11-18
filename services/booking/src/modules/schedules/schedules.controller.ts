import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SearchScheduleDto } from './dto/search-schedule.dto';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({ status: 200, description: 'Return all schedules' })
  findAll(@Query('routeId') routeId?: string) {
    if (routeId) {
      return this.schedulesService.findByRoute(routeId);
    }
    return this.schedulesService.findAll();
  }

  @Post('search')
  @ApiOperation({ summary: 'Search schedules' })
  @ApiResponse({ status: 200, description: 'Return matching schedules' })
  search(@Body() searchDto: SearchScheduleDto) {
    return this.schedulesService.search(searchDto);
  }

  @Get(':id/available-seats')
  @ApiOperation({ summary: 'Get available seats for a schedule' })
  @ApiResponse({ status: 200, description: 'Return available seats information' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  getAvailableSeats(@Param('id') id: string) {
    return this.schedulesService.getAvailableSeats(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiResponse({ status: 200, description: 'Return schedule' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel schedule' })
  @ApiResponse({ status: 200, description: 'Schedule cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  cancel(@Param('id') id: string) {
    return this.schedulesService.cancel(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark schedule as completed' })
  @ApiResponse({ status: 200, description: 'Schedule completed successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  complete(@Param('id') id: string) {
    return this.schedulesService.complete(id);
  }
}
