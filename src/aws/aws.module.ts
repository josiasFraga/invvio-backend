import { Global, Module } from '@nestjs/common';
import { s3Client, sesClient } from './aws-v3.factory';

@Global()
@Module({
  providers: [
    { provide: 'S3_CLIENT', useValue: s3Client },
    { provide: 'SES_CLIENT', useValue: sesClient },
  ],
  exports: ['S3_CLIENT', 'SES_CLIENT'],
})
export class AwsModule {}