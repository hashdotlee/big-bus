import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route' })
  @ApiResponse({ status: 201, description: 'Route created successfully' })
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active routes' })
  @ApiResponse({ status: 200, description: 'Return all active routes' })
  findAll(
    @Query('originStationId') originStationId?: string,
    @Query('destinationStationId') destinationStationId?: string,
  ) {
    if (originStationId && destinationStationId) {
      return this.routesService.findByStations(originStationId, destinationStationId);
    }
    if (originStationId) {
      return this.routesService.findByOrigin(originStationId);
    }
    return this.routesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  @ApiResponse({ status: 200, description: 'Return route' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update route' })
  @ApiResponse({ status: 200, description: 'Route updated successfully' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete route' })
  @ApiResponse({ status: 200, description: 'Route deleted successfully' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}
