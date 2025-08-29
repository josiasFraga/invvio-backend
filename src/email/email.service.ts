import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SendEmailCommand,
  SESClient,
} from '@aws-sdk/client-ses';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('SES_CLIENT') private readonly ses: SESClient,
  ) {}

  async send({ to, subject, html }: SendEmailDto) {
    const cmd = new SendEmailCommand({
      Source: 'no-reply@buzke.app.br',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    await this.ses.send(cmd);
    this.logger.verbose(`E-mail enviado → ${to}`);
  }

  async sendSuggestion(
    { to, subject, html }: SendEmailDto,
  ) {
    const cmd = new SendEmailCommand({
      Source: 'no-reply@buzke.app.br',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    await this.ses.send(cmd);
    this.logger.verbose(`E-mail enviado → ${to}`);

  }

  async sendIndication(
    { to, subject, html }: SendEmailDto,
  ) {
    const cmd = new SendEmailCommand({
      Source: 'no-reply@buzke.app.br',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    await this.ses.send(cmd);
    this.logger.verbose(`E-mail enviado → ${to}`);

  }

  async sendResetPasswordCode(
    { to, subject, html }: SendEmailDto,
  ) {
    const cmd = new SendEmailCommand({
      Source: 'no-reply@buzke.app.br',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    await this.ses.send(cmd);
    this.logger.verbose(`E-mail enviado → ${to}`);

  }

  async sendEmailValidationCode(
    { to, subject, html }: SendEmailDto,
  ) {
    const cmd = new SendEmailCommand({
      Source: 'no-reply@buzke.app.br',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    await this.ses.send(cmd);
    this.logger.verbose(`E-mail enviado → ${to}`);
    return;

  }

}
