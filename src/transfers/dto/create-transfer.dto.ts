import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsNumberString, IsNumber } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678', required: false })
  @IsString()
  @IsOptional()
  toWallet?: string;

  @ApiProperty({ example: 'uuid-of-user', required: false })
  @IsString()
  @IsOptional()
  toUserId?: string;

  @ApiProperty({ example: '3.850,00' })
  @Type(() => String)
  @Transform(({ value }) => {   
    // Remove pontos de milhar e troca vírgula por ponto
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace('.', '');
    value = value.replace(',', '.');
    console.log('value:', value);
    return parseFloat(value);
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'uuid-of-charge', required: false })
  @IsString()
  @IsOptional()
  chargeId?: string;
}
