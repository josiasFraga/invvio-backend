import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotification } from './entities/user-notification.entity';


@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(UserNotification)
        private notificationsRepository: Repository<UserNotification>,
    ) {}

	async findAll(
		userId: string,
		params: { limit?: number; offset?: number; read?: string; },
	): Promise<
		UserNotification[]
	> {
		const limit = params.limit || 10;
		const offset = params.offset || 0;

		const queryBuilder = this.notificationsRepository
			.createQueryBuilder('notification')
			.leftJoinAndSelect('notification.originUser', 'originUser')
			.where('notification.userId = :userId', { userId })
			.select([
				'notification.id',
				'notification.createdAt',
				'notification.updatedAt',
				'notification.title',
				'notification.message',
				'notification.read',
				'notification.readAt',
				
				'originUser.id',
				'originUser.nickname',
				'originUser.photoUrl',
			])
			.orderBy('notification.createdAt', 'DESC')
			.skip(offset)
			.take(limit);

		const notifications = await queryBuilder.getMany();

		return notifications;
	}
}
