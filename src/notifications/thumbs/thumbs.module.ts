import { Module } from '@nestjs/common';
import { ThumbsService } from './thumbs.service';

@Module({
  providers: [ThumbsService],
  exports: [ThumbsService], // Exporta o ThumbsService para outros módulos
})
export class ThumbsModule {}
