import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Transfer } from './transfers/entities/transfer.entity';
import { PasswordResetToken } from './password-reset/entities/password-reset-token.entity';
import { EmailValidationCode } from './email-validation-codes/entities/email-validation-code.entity';
import { NotificationId } from './notifications/entities/notification-id.entity';
import { UserNotification } from './notifications/entities/user-notification.entity';
import { NotificationMotive } from './notifications/entities/notification-motive.entity';
import { Charge } from './charges/entities/charge.entity';

ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' });

export const AppDataSource = new DataSource({
	type: 'mysql',
	host: process.env.DB_HOST || '127.0.0.1',
	port: Number(process.env.DB_PORT || 3308),
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASS || '',
	database: process.env.DB_NAME || 'invvio',
	entities: [User, Transfer, PasswordResetToken, EmailValidationCode, NotificationId, UserNotification, NotificationMotive, Charge],
	migrations: ['dist/src/migrations/*.js'],
	synchronize: false,
	logging: true,
});

export default AppDataSource;
