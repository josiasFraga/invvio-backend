import { Test, TestingModule } from '@nestjs/testing';
import { EmailValidationCodesService } from './email-validation-codes.service';

describe('EmailValidationCodesService', () => {
  let service: EmailValidationCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailValidationCodesService],
    }).compile();

    service = module.get<EmailValidationCodesService>(EmailValidationCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
