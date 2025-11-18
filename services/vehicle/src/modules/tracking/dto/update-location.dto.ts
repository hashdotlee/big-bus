import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: 'vehicle-123',
  })
  @IsString()
  vehicleId: string;

  @ApiProperty({
    description: 'Latitude',
    example: 10.762622,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: 106.660172,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Speed in km/h',
    example: 45.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiProperty({
    description: 'Heading/direction in degrees (0-360)',
    example: 180,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiProperty({
    description: 'Schedule ID (current trip)',
    example: 'schedule-456',
    required: false,
  })
  @IsOptional()
  @IsString()
  scheduleId?: string;
}
