import { Test, TestingModule } from '@nestjs/testing';
import { EmailValidationCodesController } from './email-validation-codes.controller';

describe('EmailValidationCodesController', () => {
  let controller: EmailValidationCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailValidationCodesController],
    }).compile();

    controller = module.get<EmailValidationCodesController>(EmailValidationCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
