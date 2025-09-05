import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ example: '3.850,00' })
  @Type(() => String)
  @Transform(({ value }) => {   
    // Remove pontos de milhar e troca vírgula por ponto
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace(',', '.');
    return parseFloat(value);
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
