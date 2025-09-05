import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { Charge } from './entities/charge.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Charge, User]),
    NotificationsModule
  ],
  providers: [ChargesService],
  controllers: [ChargesController]
})
export class ChargesModule {}
