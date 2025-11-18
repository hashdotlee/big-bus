import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: 'vehicle-uuid-here' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 10.762622, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 106.660172, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: 60, description: 'Speed in km/h' })
  @IsNumber()
  @Min(0)
  speed: number;

  @ApiProperty({ example: 90, description: 'Heading in degrees (0-360)' })
  @IsNumber()
  @Min(0)
  @Max(360)
  heading: number;

  @ApiProperty({ required: false, example: 'schedule-uuid-here' })
  @IsOptional()
  @IsString()
  scheduleId?: string;
}
