import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ example: 'uuid-token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
