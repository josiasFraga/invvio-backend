import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class ListTransfersDto {
  @ApiPropertyOptional({ example: 20, description: 'Quantidade máxima de transferências a retornar' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Offset para paginação' })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
