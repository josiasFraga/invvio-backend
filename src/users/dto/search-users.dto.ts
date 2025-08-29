import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUsersDto {
  @ApiProperty({ 
    example: 'john',
    description: 'Search query for nickname, email or wallet'
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}