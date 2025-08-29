import { Module } from '@nestjs/common';
import { EmailValidationCodesService } from './email-validation-codes.service';
import { EmailValidationCodesController } from './email-validation-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailValidationCode } from './entities/email-validation-code.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailValidationCode]),
    EmailModule,
  ],
  providers: [EmailValidationCodesService],
  controllers: [EmailValidationCodesController],
  exports: [EmailValidationCodesService],
})
export class EmailValidationCodesModule {}
