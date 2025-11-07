import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@ApiTags('stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active stations' })
  @ApiResponse({ status: 200, description: 'Return all active stations' })
  findAll(@Query('city') city?: string, @Query('province') province?: string) {
    if (city) {
      return this.stationsService.findByCity(city);
    }
    if (province) {
      return this.stationsService.findByProvince(province);
    }
    return this.stationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Return station' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update station' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete station' })
  @ApiResponse({ status: 200, description: 'Station deleted successfully' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}
