import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdatePhotoDto {
  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  photoUrl: string;
}