import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePayIdDto {
  @ApiProperty({ example: 'meu.email@exemplo.com', description: 'Identificador público do usuário (email, telefone ou outra string única)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  payId: string;
}
