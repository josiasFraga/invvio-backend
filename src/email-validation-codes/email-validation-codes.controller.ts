import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { EmailValidationCodesService } from './email-validation-codes.service';
import { SendEmailValidationCodeDto } from './dto/send-email-validation-code.dto';
import { ValidateEmailCodeDto } from './dto/validate-email-code.dto';

@Controller('email-validation-codes')
export class EmailValidationCodesController {
    constructor(
        private readonly emailValidationCodesService: EmailValidationCodesService,
    ) {}

    @Post()
    async sendEmailValidationCode(
        @Body() data: SendEmailValidationCodeDto
    ) {
        return this.emailValidationCodesService.sendEmailValidationCode(data.email);
    }

    @Post('validate')
    async validateEmailCode(
        @Body() data: ValidateEmailCodeDto
    ) {
        const validate = await this.emailValidationCodesService.validateEmailCode(data.email, data.code);

        if ( validate ) {
            return { status: 'success', message: 'Código de validação válido.' };
        }

        throw new BadRequestException('Código de validação inválido ou expirado.');
    }
}
