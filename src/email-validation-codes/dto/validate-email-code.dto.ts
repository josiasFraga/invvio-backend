import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateEmailCodeDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsNotEmpty({ message: 'O código é obrigatório.' })
  @IsString({ message: 'O código deve ser uma string.' })
  @Length(4, 6, { message: 'O código deve ter entre 4 e 6 caracteres.' })
  code: string;
}
