import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UploadModule } from 'src/upload/upload.module';
import { NotificationId } from 'src/notifications/entities/notification-id.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, NotificationId]),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}