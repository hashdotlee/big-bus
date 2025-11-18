import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldP@ssw0rd' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'NewP@ssw0rd', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
