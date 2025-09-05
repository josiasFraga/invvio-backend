import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotification } from './entities/user-notification.entity';
import { NotificationMotive } from './entities/notification-motive.entity';
import { User } from '../users/entities/user.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
import { ThumbsService } from './thumbs/thumbs.service';
import { NotificationId } from './entities/notification-id.entity';
import { Charge } from '../charges/entities/charge.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(UserNotification)
        private notificationsRepository: Repository<UserNotification>,
		@InjectRepository(NotificationMotive)
        private notificationMotiveRepository: Repository<NotificationMotive>,
		@InjectRepository(User)
        private userRepository: Repository<User>,
		@InjectRepository(Transfer)
        private transferRepository: Repository<Transfer>,
		@InjectRepository(NotificationId)
        private notificationIdRepository: Repository<NotificationId>,
		@InjectRepository(Charge)
        private chargeRepository: Repository<Charge>,

        private readonly thumbsService: ThumbsService,
		private readonly httpService: HttpService
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
			.leftJoinAndSelect('notification.notificationMotive', 'motive')
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

				'motive.id',
				'motive.motive',
			])
			.orderBy('notification.createdAt', 'DESC')
			.skip(offset)
			.take(limit);

		const notifications = await queryBuilder.getMany();

		return notifications;
	}

	async countNotRead(
		userId: string,
	): Promise<number> {
		const count = await this.notificationsRepository
			.createQueryBuilder('notification')
			.where('notification.userId = :userId', { userId })
			.andWhere('notification.read = :read', { read: false })
			.getCount();

		return count;
	}

	async setAsRead(
		userId: string,
		notificationId: string,
	): Promise<{ status: string; message: string }> {

		const notification = await this.notificationsRepository.createQueryBuilder('notification')
			.where('notification.id = :notificationId', { notificationId })
			.andWhere('notification.userId = :userId', { userId })
			.getOne();

		if (!notification) {
			throw new NotFoundException('Notificação não encontrada ou não pertence ao usuário.');
		}

		if ( notification.read ) {
			return { status: 'success', message: 'Notificação já está marcada como lida.' };
		}

		try {

			notification.read = true;
			notification.readAt = new Date();

			await this.notificationsRepository.save(notification);

			return { status: 'success', message: 'Notificação marcada como lida.' };
		} catch (error) {
			throw new InternalServerErrorException('Erro ao marcar notificação como lida: ' + error.message);
		}
	}

	async sendNotification(
		originUserId: string | null, 
		destinyUserId: string, 
		motiveName: string, 
		idRegister: string | null,
		sendDestinyUserPhoto?: boolean | false,
		androidGroupMessage?: any | { en: '$[notif_count] Notificações' },
		extraData?: { [key: string]: any; },
	) {
		
        const mountedMesage = await this.buildMessageByMotive(
            motiveName, 
            {
                idRegister: idRegister, 
                originUserId: originUserId,
                destinyUserId: destinyUserId,
                sendDestinyUserPhoto: sendDestinyUserPhoto || false,
				extraData: extraData || {},
            }
        );

        if ( mountedMesage.status !== 'success' ) {
            return {
                'status': mountedMesage.status,
                'message': mountedMesage.statusMessage,
            }
        }

		let sendNotification = true;
		if ( !extraData || !extraData.dontSendOneSignal ) {
			sendNotification = await this.sendNotificationFromOneSignal(
				motiveName, 
				mountedMesage.finalTitle,
				mountedMesage.finalMessage,
				destinyUserId,
				androidGroupMessage,
				{
				   ...mountedMesage.extraData,
				   largeIcon: mountedMesage.largeIcon,
				},
			);

		}

        let notificationIdOneSignal = null;
        if ( sendNotification !== true && sendNotification !== false ) {
            notificationIdOneSignal = sendNotification;
        }

        return this.saveNotification({
            oneSignalId: notificationIdOneSignal,
            registerId: idRegister,
            motiveId: mountedMesage.extraData.motiveId,
            agendamento_data_hora: null,
            title: mountedMesage.finalTitle,
            message: mountedMesage.finalMessage,
            read: 'N',
            big_picture: mountedMesage.bigPicture,
            large_icon: mountedMesage.largeIcon,
            acao_selecionada: extraData?.acao_selecionada || null,
            acao_selecionada_desc: extraData?.acao_selecionada_desc || null,
            originUserId,
            destinyUserId,
        });
	}

	async buildMessageByMotive(
		motive: string,
		params: {
		  idRegister: string | null;
		  originUserId: string | null;
		  destinyUserId: string | null;
		  sendDestinyUserPhoto: false | true;
		  extraData?: { [key: string]: any; };
		},
	  ): Promise<{ 
		status: string, 
		statusMessage?: string, 
		finalMessage: string; 
		finalTitle: string; 
		extraData: any;
		largeIcon: any;
		bigPicture?: string;
	}> {
	
		const extraData = {
			registerId: params.idRegister,
			motivo: motive,
		};
	
		let largeIcon = null as any;
		let bigPicture = null as any;
		let msg = '';
		let title = '';

		const motiveDados = await this.notificationMotiveRepository.findOne({
			select: {
				id: true,
				title: true,
				message: true,
				motive: true,
			},
			where: {
				motive: motive
			}
		});
	
		if ( !motiveDados ) {
			return {
				status: 'error',
				statusMessage: 'Motivo da notificação não informado!',
				finalMessage: '',
				finalTitle: '',
				largeIcon: null,
				extraData,
			};
		}

        msg = motiveDados.message;
        title = motiveDados.title;
		extraData['motiveId'] = motiveDados.id;
	
		let originUser: User | null = null;
		if ( params.originUserId ) {
			originUser = await this.userRepository.findOne({
				where: {
					id: params.originUserId
				},
				select: {
					id: true,
					nickname: true,
					photoUrl: true
				}
			});

			if ( params.sendDestinyUserPhoto && originUser ) {
				largeIcon = this.thumbsService.getRoundThumbFromImage(originUser.photoUrl);
			}

			title = title
				.replace('{{origin_name}}', originUser?.nickname || '');
			msg = msg
				.replace('{{origin_name}}', originUser?.nickname || '');
		}

		let destinyUser: User | null = null;
		if ( params.destinyUserId ) {
			destinyUser = await this.userRepository.findOne({
				where: {
					id: params.destinyUserId
				},
				select: {
					id: true,
					nickname: true,
					photoUrl: true,
				}
			});

			title = title
				.replace('{{destiny_name}}', destinyUser?.nickname || '');
			msg = msg
				.replace('{{destiny_name}}', destinyUser?.nickname || '');
		}

		if ( motive === 'transfer_received' ) {

            const transferData = await this.transferRepository.findOne({
                where: {
                    id: params.idRegister
                }
            });

			if ( !transferData ) {
				return {
					status: 'error',
					statusMessage: 'Transferência não encontrada!',
					finalMessage: '',
					finalTitle: '',
					largeIcon: null,
					extraData,
				};
			}

            msg = msg.replace('{{transfer_value}}', transferData.amount.toString());

		} else if ( motive === 'charge_received' ) {

			const chargeData = await this.chargeRepository.findOne({
				where: {
					id: params.idRegister
				}
			});

			if ( !chargeData ) {
				return {
					status: 'error',
					statusMessage: 'Cobrança não encontrada!',
					finalMessage: '',
					finalTitle: '',
					largeIcon: null,
					extraData,
				};
			}

            msg = msg.replace('{{charge_value}}', chargeData.amount.toString());
		}

		return {
			status: 'success',
			finalMessage: msg,
			finalTitle: title,
			largeIcon: largeIcon,
			bigPicture: bigPicture,
			extraData,
		};
	}

	async sendNotificationFromOneSignal(
		motive: string,  
		title: string,
		message: string,
		destinyUserId: string,
		groupMessage: any = { en: '$[notif_count] Notificações' },
		params: {
			[key: string]: any;     // Permite propriedades adicionais, caso necessário
		},
	) {
		// Exemplo: checa se "SEND_NOTIFICATIONS" está habilitado
		if (process.env.SEND_NOTIFICATIONS === 'FALSE' || !destinyUserId) {
			return true; // se não for pra enviar, retorna cedo
		}

		let largeIcon: any = params.largeIcon ?? null;
		let bigPicture: any = params.bigPicture ?? null;

		const motiveDados = await this.notificationMotiveRepository.findOne({
			select: {
				id: true,
				title: true,
				message: true,
				motive: true,
			},
			where: {
				motive: motive
			}
		});
	
		if ( !motiveDados ) {
			console.error('[ERROR] Motivo da notificação não informado!');
		  	return false;
		}


		// Calcula a data para 60 dias atrás
		const dateLimit = new Date();
		dateLimit.setDate(dateLimit.getDate() - 60);

		// Busca os ids de notificação do usuário
		const destinyUserTokens = await this.notificationIdRepository
		.createQueryBuilder("notificationId")
		.select("notificationId.notificationId", "notification_id")
		.addSelect("MAX(notificationId.updatedAt)", "latest_modified") // Seleciona a data mais recente de criação para agrupar
		.where("notificationId.userId = :userId", { userId: destinyUserId }) // Filtro pelo usuário
		.andWhere("(notificationId.createdAt >= :dateLimit OR notificationId.updatedAt >= :dateLimit)", { dateLimit }) // Filtro de 60 dias
		.groupBy("notificationId.notificationId") // Agrupa por notificationId
		.orderBy("latest_modified", "DESC") // Ordena pela data mais recente
		.take(3) // Limita a 3 resultados
		.getRawMany();

		if ( destinyUserTokens.length === 0 ) {
			console.error('[INFO] Usuário sem tokens de notificação!');
			return true;
		}

		const destinyTokens = destinyUserTokens.map(token => token.notification_id);

		let onesignalPayload = {
			app_id: process.env.ONE_SIGNAL_APP_ID,
			include_player_ids: destinyTokens,
			data: params,
			small_icon: 'ic_stat_onesignal_default',
			large_icon: largeIcon,
			android_group: motiveDados.motive,
			android_group_message: groupMessage,
			headings: { en: title },
			contents: { en: message },
			big_picture: bigPicture,
		};

		const url = 'https://onesignal.com/api/v1/notifications';
		const headers = {
			'Content-Type': 'application/json; charset=utf-8',
			Authorization: `Basic ${process.env.ONE_SIGNAL_API_KEY}`,
		};

		try {
			const response = await firstValueFrom(
			  this.httpService.post(url, onesignalPayload, { headers }),
			);
	  
			const resultData = response.data;
			if (resultData && resultData.id) {
				console.log('[SUCCESS] Notificação enviada com sucesso', resultData.id);
			  	return resultData.id;
			} else {
			  console.warn('OneSignal resposta inválida', resultData);
			  return false;
			}
		} catch (err) {
			console.error('Erro ao chamar OneSignal', err);
			return false;
		}

	}

	async saveNotification(data: any) {
		const {
			oneSignalId,
			registerId,
			motiveId,
			title,
			message,
			big_picture,
			large_icon,
			originUserId,
			destinyUserId,
		} = data;

		console.log('[INFO] Salvando notificação...');

		// Criação da notificação com os dados principais
		const notification = this.notificationsRepository.create({
			notificationId: oneSignalId,
			registerId: registerId,
			notificationMotiveId: motiveId,
			title,
			message,
			originUserId: originUserId, // Relacionamento com User
			userId: destinyUserId
		});
		
		// Salvar a notificação e as associações
		const try_save = await this.notificationsRepository.save(notification);

		if ( try_save ) {
			console.log('[SUCCESS] Notificação salva com sucesso!');
			return {
				status: 'success',
				message: 'Notificação salva com sucesso!',
			};
		} else {
			console.error('[ERROR] Notificação não salva!');
			return {
				status: 'error',
				message: 'Erro ao salvar a notificação!',
			};
		}
	}
}
