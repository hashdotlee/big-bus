import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';

@ApiTags('maintenance')
@Controller('vehicles/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all maintenance records' })
  @ApiResponse({ status: 200, description: 'Return all maintenance records' })
  @ApiQuery({ name: 'vehicleId', required: false, description: 'Filter by vehicle ID' })
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.maintenanceService.findAll(vehicleId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming maintenance' })
  @ApiResponse({ status: 200, description: 'Return upcoming maintenance records' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Days to look ahead (default: 30)' })
  getUpcoming(@Query('daysAhead') daysAhead?: number) {
    return this.maintenanceService.getUpcoming(daysAhead ? parseInt(daysAhead.toString()) : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance record by ID' })
  @ApiResponse({ status: 200, description: 'Return maintenance record' })
  @ApiResponse({ status: 404, description: 'Maintenance record not found' })
  @ApiParam({ name: 'id', description: 'Maintenance record ID' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create maintenance record' })
  @ApiResponse({ status: 201, description: 'Maintenance record created successfully' })
  create(@Body() data: any) {
    return this.maintenanceService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update maintenance record' })
  @ApiResponse({ status: 200, description: 'Maintenance record updated successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance record not found' })
  @ApiParam({ name: 'id', description: 'Maintenance record ID' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.maintenanceService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete maintenance record' })
  @ApiResponse({ status: 204, description: 'Maintenance record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance record not found' })
  @ApiParam({ name: 'id', description: 'Maintenance record ID' })
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
