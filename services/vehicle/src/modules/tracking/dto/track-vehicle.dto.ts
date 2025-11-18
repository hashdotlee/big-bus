import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackVehicleDto {
  @ApiProperty({
    description: 'Vehicle ID to track',
    example: 'vehicle-123',
  })
  @IsString()
  vehicleId: string;
}
