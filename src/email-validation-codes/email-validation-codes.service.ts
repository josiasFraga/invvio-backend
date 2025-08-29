import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailValidationCode } from './entities/email-validation-code.entity';
import { MoreThan, Repository } from 'typeorm';
import { generate6DigitCode } from 'src/utils/random-code';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class EmailValidationCodesService {
  constructor(
    @InjectRepository(EmailValidationCode)
    private emailValidationCodesRepository: Repository<EmailValidationCode>,

    private readonly emailService: EmailService
  ) {}

  async createEmailValidationCode(email: string): Promise<EmailValidationCode> {
    // Gera código aleatório de 6 números
    const code = generate6DigitCode();
    // Validade de 10 minutos
    const validade = new Date(Date.now() + 10 * 60 * 1000);
    const emailValidationCode = this.emailValidationCodesRepository.create({
      email,
      code,
      expires: validade,
    });
    return await this.emailValidationCodesRepository.save(emailValidationCode);
  }

  async validateEmailCode(email: string, code: string): Promise<boolean> {
    const emailValidationCode = await this.emailValidationCodesRepository.findOne({
      where: { email, code, expires: MoreThan(new Date()) },
    });
    return !!emailValidationCode;
  }

  async sendEmailValidationCode(email: string): Promise<{ status: string; message: string }> {
    const existingCode = await this.emailValidationCodesRepository.findOne({
      where: { email, expires: MoreThan(new Date()) },
    });

    try {

        if (existingCode) {
            await this.emailService.sendEmailValidationCode({
                to: email,
                subject: 'Código de Validação de E-mail',
                html: `Seu código de validação é <b>${existingCode.code}</b>.<br/>
                       Ele expira em 10 minutos.`,
            });
        } else {
            const newCode = await this.createEmailValidationCode(email);
            await this.emailService.sendEmailValidationCode({
                to: email,
                subject: 'Código de Validação de E-mail',
                html: `Seu código de validação é <b>${newCode.code}</b>.<br/>
                       Ele expira em 10 minutos.`,
            });
        }

        return { status: 'success', message: 'Código de validação enviado com sucesso.' };
    } catch (error) {
        console.error('Error sending email validation code:', error);
        throw new InternalServerErrorException('Erro ao enviar o código de validação por e-mail.');
    }
  }
}
