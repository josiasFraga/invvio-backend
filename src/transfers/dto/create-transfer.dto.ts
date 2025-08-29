import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678', required: false })
  @IsString()
  @IsOptional()
  toWallet?: string;

  @ApiProperty({ example: 'uuid-of-user', required: false })
  @IsString()
  @IsOptional()
  toUserId?: string;

  @ApiProperty({ example: '100.50' })
  @IsNumberString()
  @IsNotEmpty()
  amount: string;
}
