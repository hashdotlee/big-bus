import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { UpdateLocationDto } from './dto';

@ApiTags('Vehicle Tracking')
@Controller('tracking')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  @Post('location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update vehicle location',
    description: 'Update the current location of a vehicle (typically called by driver app)',
  })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async updateLocation(@Body() updateLocationDto: UpdateLocationDto) {
    this.logger.log(`Updating location for vehicle ${updateLocationDto.vehicleId}`);

    const location = await this.trackingService.updateLocation(updateLocationDto);

    // Broadcast to WebSocket clients
    await this.trackingGateway.broadcastLocationUpdate(location);

    return {
      success: true,
      message: 'Location updated successfully',
      data: location,
    };
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Get vehicle location',
    description: 'Get the current location of a specific vehicle',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'Vehicle ID',
    example: 'vehicle-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle location retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found or has no location data',
  })
  async getVehicleLocation(@Param('vehicleId') vehicleId: string) {
    const location = await this.trackingService.getVehicleLocation(vehicleId);

    if (!location) {
      return {
        success: false,
        message: 'Vehicle not found or has no location data',
        data: null,
      };
    }

    return {
      success: true,
      data: location,
    };
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get all active vehicle locations',
    description: 'Get locations of all vehicles that are currently being tracked',
  })
  @ApiResponse({
    status: 200,
    description: 'Active vehicle locations retrieved successfully',
  })
  async getAllActiveLocations() {
    const locations = await this.trackingService.getAllActiveVehicleLocations();

    return {
      success: true,
      count: locations.length,
      data: locations,
    };
  }

  @Get('schedule/:scheduleId')
  @ApiOperation({
    summary: 'Get vehicle locations for a schedule',
    description: 'Get locations of all vehicles assigned to a specific schedule/trip',
  })
  @ApiParam({
    name: 'scheduleId',
    description: 'Schedule ID',
    example: 'schedule-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule vehicle locations retrieved successfully',
  })
  async getScheduleLocations(@Param('scheduleId') scheduleId: string) {
    const locations = await this.trackingService.getScheduleVehicleLocations(
      scheduleId,
    );

    return {
      success: true,
      scheduleId,
      count: locations.length,
      data: locations,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get tracking statistics',
    description: 'Get statistics about WebSocket connections and tracking activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats() {
    const stats = this.trackingGateway.getStats();

    return {
      success: true,
      data: stats,
    };
  }

  @Post('stop/:vehicleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop tracking a vehicle',
    description: 'Remove a vehicle from active tracking',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'Vehicle ID',
    example: 'vehicle-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle tracking stopped successfully',
  })
  async stopTracking(@Param('vehicleId') vehicleId: string) {
    await this.trackingService.stopTracking(vehicleId);

    return {
      success: true,
      message: `Stopped tracking vehicle ${vehicleId}`,
    };
  }
}
