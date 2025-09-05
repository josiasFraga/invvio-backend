import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserNotification } from './entities/user-notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationMotive } from './entities/notification-motive.entity';
import { User } from '../users/entities/user.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
import { NotificationId } from './entities/notification-id.entity';
import { ThumbsModule } from './thumbs/thumbs.module';
import { HttpModule } from '@nestjs/axios';
import { Charge } from 'src/charges/entities/charge.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotification, NotificationMotive, User, Transfer, NotificationId, Charge]),
    ThumbsModule,
    HttpModule,
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
