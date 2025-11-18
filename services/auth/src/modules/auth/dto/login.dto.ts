import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com or +84901234567',
    description: 'Email or phone number'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'SecureP@ssw0rd' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
