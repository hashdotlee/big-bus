import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleType } from '@big-bus/types';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 409, description: 'Vehicle with this plate number already exists' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active vehicles' })
  @ApiResponse({ status: 200, description: 'Return all active vehicles' })
  findAll(@Query('type') type?: VehicleType) {
    if (type) {
      return this.vehiclesService.findByType(type);
    }
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Return vehicle' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 409, description: 'Plate number already exists' })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Patch(':id/maintenance')
  @ApiOperation({ summary: 'Record vehicle maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance recorded successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  recordMaintenance(@Param('id') id: string, @Body('maintenanceDate') maintenanceDate: Date) {
    return this.vehiclesService.recordMaintenance(id, maintenanceDate);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
