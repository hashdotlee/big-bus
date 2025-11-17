import { VehicleType, VehicleStatus } from '@big-bus/types';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { CreateVehicleDto, UpdateVehicleDto, RecordMaintenanceDto } from './dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Vehicle with this plate number already exists',
  })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({ status: 200, description: 'Return all vehicles' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: VehicleType,
    description: 'Filter by vehicle type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: VehicleStatus,
    description: 'Filter by vehicle status',
  })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('type') type?: VehicleType,
    @Query('status') status?: VehicleStatus,
  ) {
    const isActiveBool =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.vehiclesService.findAll(isActiveBool, type, status);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get vehicle statistics' })
  @ApiResponse({ status: 200, description: 'Return vehicle statistics' })
  getStatistics() {
    return this.vehiclesService.getStatistics();
  }

  @Get('maintenance-needed')
  @ApiOperation({ summary: 'Get vehicles that need maintenance' })
  @ApiResponse({
    status: 200,
    description: 'Return vehicles needing maintenance',
  })
  @ApiQuery({
    name: 'daysAhead',
    required: false,
    type: Number,
    description: 'Number of days to look ahead (default: 7)',
  })
  findVehiclesNeedingMaintenance(@Query('daysAhead') daysAhead?: number) {
    return this.vehiclesService.findVehiclesNeedingMaintenance(
      daysAhead ? parseInt(daysAhead.toString(), 10) : 7,
    );
  }

  @Get('plate/:plateNumber')
  @ApiOperation({ summary: 'Get vehicle by plate number' })
  @ApiResponse({ status: 200, description: 'Return vehicle' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiParam({ name: 'plateNumber', description: 'Vehicle plate number' })
  findByPlateNumber(@Param('plateNumber') plateNumber: string) {
    return this.vehiclesService.findByPlateNumber(plateNumber);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get vehicles by type' })
  @ApiResponse({ status: 200, description: 'Return vehicles of specified type' })
  @ApiParam({ name: 'type', enum: VehicleType, description: 'Vehicle type' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status (default: true)',
  })
  findByType(
    @Param('type') type: VehicleType,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive !== undefined ? isActive === 'true' : true;
    return this.vehiclesService.findByType(type, isActiveBool);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get vehicles by status' })
  @ApiResponse({
    status: 200,
    description: 'Return vehicles with specified status',
  })
  @ApiParam({
    name: 'status',
    enum: VehicleStatus,
    description: 'Vehicle status',
  })
  findByStatus(@Param('status') status: VehicleStatus) {
    return this.vehiclesService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Return vehicle' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 409, description: 'Plate number already exists' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Patch(':id/mileage')
  @ApiOperation({ summary: 'Update vehicle mileage' })
  @ApiResponse({ status: 200, description: 'Mileage updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 400, description: 'Invalid mileage value' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  updateMileage(@Param('id') id: string, @Body('mileage') mileage: number) {
    return this.vehiclesService.updateMileage(id, mileage);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change vehicle status' })
  @ApiResponse({ status: 200, description: 'Status changed successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  changeStatus(@Param('id') id: string, @Body('status') status: VehicleStatus) {
    return this.vehiclesService.changeStatus(id, status);
  }

  @Patch(':id/maintenance')
  @ApiOperation({ summary: 'Record vehicle maintenance' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance recorded successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  recordMaintenance(
    @Param('id') id: string,
    @Body() recordMaintenanceDto: RecordMaintenanceDto,
  ) {
    return this.vehiclesService.recordMaintenance(id, recordMaintenanceDto);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle restored successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 400, description: 'Vehicle is already active' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  restore(@Param('id') id: string) {
    return this.vehiclesService.restore(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete vehicle (set isActive to false)' })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete vehicle from database' })
  @ApiResponse({
    status: 204,
    description: 'Vehicle permanently deleted',
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  permanentDelete(@Param('id') id: string) {
    return this.vehiclesService.delete(id);
  }
}
