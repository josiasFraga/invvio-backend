import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Transfer, TransferStatus } from './entities/transfer.entity';
import { User } from '../users/entities/user.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Charge } from 'src/charges/entities/charge.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Charge)
    private readonly chargeRepository: Repository<Charge>,

    private readonly notificationsService: NotificationsService
  ) {}

  async createTransfer(userId: string, createTransferDto: CreateTransferDto): Promise<Transfer> {
    const { toWallet, toUserId, amount } = createTransferDto;
    // Validações básicas
    if (!toWallet && !toUserId) {
      throw new BadRequestException('toUserId or toWallet must be provided');
    }

    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be a positive number string');
    }

    const sender = await this.userRepository.findOne({ where: { id: userId } });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // TypeORM may return decimal columns as strings. Convertemos explicitamente para número.
    const senderBalanceNum = Number(sender.balance) || 0;
    if (senderBalanceNum < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const receiver = toWallet
      ? await this.userRepository.findOne({ where: { wallet: toWallet } })
      : await this.userRepository.findOne({ where: { id: toUserId } });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    if (receiver.id === sender.id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const receiverBalanceNum = Number(receiver.balance) || 0;

    // Atualiza saldos usando valores numéricos e toFixed para limitar precisão
    sender.balance = Number((senderBalanceNum - amount).toFixed(8));
    receiver.balance = Number((receiverBalanceNum + amount).toFixed(8));

    let chargeData: Charge | null = null;
    if ( createTransferDto.chargeId ) {
      chargeData = await this.chargeRepository.findOne({ where: { id: createTransferDto.chargeId, status: 'pending', expiresAt: MoreThan(new Date()) } });

      if ( !chargeData) {
        throw new NotFoundException('Charge not found');
      }
    }
  
    try {

      const transfer = this.transferRepository.create({
        senderUserId: sender.id,
        receiverUserId: receiver.id,
        amount,
        status: TransferStatus.SUCCESS,
      });

      await this.userRepository.save([sender, receiver]);
      const savedTransfer = await this.transferRepository.save(transfer);

      if ( chargeData ) {
        await this.chargeRepository.save({
          id: chargeData.id,
          status: 'paid',
        });
      }

      // Envia notificação
      this.notificationsService.sendNotification(
          sender.id, 
          receiver.id, 
          'transfer_received', 
          savedTransfer.id,
          true,
          { en: '$[notif_count] Transferência recebida' },
      );

      return savedTransfer;

    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  }

  async findTransfers(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<(Transfer & { type: 'sended' | 'received' })[]> {
    const { limit = 20, offset = 0 } = options || {};
    const qb = this.transferRepository.createQueryBuilder('transfer')
    .leftJoinAndSelect('transfer.senderUser', 'senderUser')
    .leftJoinAndSelect('transfer.receiverUser', 'receiverUser');
    qb.where('transfer.senderUserId = :userId', { userId })
      .orWhere('transfer.receiverUserId = :userId', { userId })
      .select([
        'transfer.id',
        'transfer.amount',
        'transfer.createdAt',
        'transfer.senderUserId',
        'transfer.receiverUserId',

        'senderUser.id',
        'senderUser.nickname',
        'senderUser.wallet',
        'senderUser.photoUrl',

        'receiverUser.id',
        'receiverUser.nickname',
        'receiverUser.wallet',
        'receiverUser.photoUrl',
      ])
      .orderBy('transfer.createdAt', 'DESC')
      .take(limit)
      .skip(offset);
    const transfers = await qb.getMany();
    return transfers.map(t => ({
      ...t,
      type: t.senderUserId === userId ? 'sended' : 'received',
    }));
  }
}
