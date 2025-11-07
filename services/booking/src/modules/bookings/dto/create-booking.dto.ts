import { IsString, IsArray, IsOptional, IsEnum, IsUUID, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingType, PassengerGender } from '@big-bus/types';

export class PassengerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 30 })
  age: number;

  @ApiProperty({ example: 'male', enum: PassengerGender })
  @IsEnum(PassengerGender)
  gender: PassengerGender;

  @ApiProperty({ example: '123456789' })
  @IsString()
  idNumber: string;

  @ApiProperty({ example: 'A1', required: false })
  @IsOptional()
  @IsString()
  seatNumber?: string;
}

export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  scheduleId: string;

  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];

  @ApiProperty({ example: ['A1', 'A2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seatNumbers?: string[];

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  pickupStationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID()
  dropoffStationId: string;

  @ApiProperty({ example: 'PROMO2024', required: false })
  @IsOptional()
  @IsString()
  promotionCode?: string;

  @ApiProperty({ example: 'I need a window seat', required: false })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({ example: 'one_way', enum: BookingType })
  @IsEnum(BookingType)
  bookingType: BookingType;
}
