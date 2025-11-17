import {
  Controller,
  Get,
  Post,
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
import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('location')
  @ApiOperation({ summary: 'Update vehicle location (GPS device endpoint)' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  updateLocation(@Body() updateLocationDto: UpdateLocationDto) {
    return this.trackingService.updateLocation(
      updateLocationDto.vehicleId,
      updateLocationDto.latitude,
      updateLocationDto.longitude,
      updateLocationDto.speed,
      updateLocationDto.heading,
      updateLocationDto.scheduleId,
    );
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'Get all active vehicle locations' })
  @ApiResponse({ status: 200, description: 'Return all active vehicle locations' })
  getAllActiveLocations() {
    return this.trackingService.getAllActiveLocations();
  }

  @Get('vehicles/:id/location')
  @ApiOperation({ summary: 'Get current location of a vehicle' })
  @ApiResponse({ status: 200, description: 'Return vehicle location' })
  @ApiResponse({ status: 404, description: 'Location data not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  getVehicleLocation(@Param('id') id: string) {
    return this.trackingService.getVehicleLocation(id);
  }

  @Get('vehicles/:id/route/:scheduleId')
  @ApiOperation({ summary: 'Get route tracking for a vehicle on a schedule' })
  @ApiResponse({ status: 200, description: 'Return route tracking data' })
  @ApiResponse({ status: 404, description: 'Location data not found' })
  @ApiParam({ name: 'id', description: 'Vehicle UUID' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule UUID' })
  getRouteTracking(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.trackingService.getRouteTracking(id, scheduleId);
  }
}
