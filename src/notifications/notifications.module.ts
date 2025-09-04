import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserNotification } from './entities/user-notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
  providers: [NotificationsService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
