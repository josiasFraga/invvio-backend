import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Charge } from './entities/charge.entity';
import { User } from '../users/entities/user.entity';
import { CreateChargeDto } from './dto/create-charge.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChargesService {
	constructor(
		@InjectRepository(Charge)
		private readonly chargeRepository: Repository<Charge>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		private readonly notificationsService: NotificationsService,
	) {}

	async createCharge(creatorUserId: string, dto: CreateChargeDto): Promise<Charge> {
		const { targetUserId, amount } = dto;

		if (creatorUserId === targetUserId) {
			throw new BadRequestException('Cannot create charge for yourself');
		}

		const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
		if (!targetUser) throw new NotFoundException('Target user not found');

		const value = Number(amount);
		if (isNaN(value) || value <= 0) throw new BadRequestException('Invalid amount');

        try {

            const charge = this.chargeRepository.create({
                creatorUserId,
                targetUserId,
                amount: value,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
            });

            const savedCharge = await this.chargeRepository.save(charge);

            // Envia notificação
            this.notificationsService.sendNotification(
                creatorUserId, 
                targetUserId, 
                'charge_received', 
                savedCharge.id,
                true,
                { en: '$[notif_count] Cobrança recebida' },
            );

            return savedCharge;

        } catch (error) {
            console.error('Error parsing amount:', error);
            throw new BadRequestException('Invalid amount format');
        }
	}

	async listCharges(userId: string, options?: { limit?: number; offset?: number }) {
		const { limit = 20, offset = 0 } = options || {};
		const qb = this.chargeRepository.createQueryBuilder('charge')
            .leftJoinAndSelect('charge.creatorUser', 'creatorUser')
            .leftJoinAndSelect('charge.targetUser', 'targetUser')
            .where('charge.expiresAt > :now', { now: new Date() })
            .andWhere('charge.status = :status', { status: 'pending' })
			.andWhere('(charge.creatorUserId = :userId OR charge.targetUserId = :userId)', { userId })
            .select([
                'charge.id',
                'charge.amount',
                'charge.createdAt',
                'charge.expiresAt',
                'charge.creatorUserId',
                'charge.targetUserId',

                'creatorUser.id',
                'creatorUser.nickname',
                'creatorUser.photoUrl',

                'targetUser.id',
                'targetUser.nickname',
                'targetUser.photoUrl',
            ])
			.orderBy('charge.createdAt', 'DESC')
			.take(limit)
			.skip(offset);

			const charges = await qb.getMany();
			return charges.map(c => ({
				...c,
				type: c.creatorUserId === userId ? 'sent' : 'received',
			}));
	}

    async findChargeById(userId: string, chargeId: string): Promise<Charge> {
        const query = this.chargeRepository.createQueryBuilder('charge')
            .leftJoinAndSelect('charge.creatorUser', 'creatorUser')
            .leftJoinAndSelect('charge.targetUser', 'targetUser')
            .where('charge.id = :chargeId', { chargeId })
            .andWhere('charge.expiresAt > :now', { now: new Date() })
            .andWhere('charge.status = :status', { status: 'pending' })
            .andWhere('(charge.creatorUserId = :userId OR charge.targetUserId = :userId)', { userId })
            .select([
                'charge.id',
                'charge.amount',
                'charge.createdAt',
                'charge.expiresAt',
                'charge.creatorUserId',
                'charge.targetUserId',

                'creatorUser.id',
                'creatorUser.nickname',
                'creatorUser.photoUrl',

                'targetUser.id',
                'targetUser.nickname',
                'targetUser.photoUrl',
            ]);
        const charge = await query.getOne();

        if ( !charge ) {
            throw new NotFoundException('Charge not found');
        }
    
        charge.type = charge.creatorUserId === userId ? 'sent' : 'received';
    
        return charge;
    }
}
