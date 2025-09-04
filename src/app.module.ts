import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransfersModule } from './transfers/transfers.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { User } from './users/entities/user.entity';
import { Transfer } from './transfers/entities/transfer.entity';
import { PasswordResetToken } from './password-reset/entities/password-reset-token.entity';
import { EmailValidationCode } from './email-validation-codes/entities/email-validation-code.entity';
import { NotificationId } from './notifications/entities/notification-id.entity';
import { EmailValidationCodesModule } from './email-validation-codes/email-validation-codes.module';
import { EmailModule } from './email/email.module';
import { AwsModule } from './aws/aws.module';
import { UploadModule } from './upload/upload.module';
import { UserNotification } from './notifications/entities/user-notification.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationMotive } from './notifications/entities/notification-motive.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', '127.0.0.1'),
        port: configService.get('DB_PORT', 3308),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASS', ''),
        database: configService.get('DB_NAME', 'invvio'),
        entities: [User, Transfer, PasswordResetToken, EmailValidationCode, NotificationId, UserNotification, NotificationMotive],
        synchronize: configService.get('NODE_ENV', 'development') === 'development',
        logging: configService.get('NODE_ENV', 'development') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TransfersModule,
    PasswordResetModule,
    EmailValidationCodesModule,
    EmailModule,
    AwsModule,
    UploadModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}