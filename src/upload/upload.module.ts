import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ImageProcessorService } from './image-processor.service';
import { UploadService } from './upload.service';

@Module({
  providers: [S3Service, ImageProcessorService, UploadService],
  exports: [UploadService], // EXPORTA para ser usado em outros módulos
})
export class UploadModule {}
