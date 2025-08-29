import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransferStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  senderUserId: string;

  @Column({ type: 'uuid' })
  receiverUserId: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ nullable: true })
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sentTransfers)
  @JoinColumn({ name: 'senderUserId' })
  senderUser: User;

  @ManyToOne(() => User, (user) => user.receivedTransfers)
  @JoinColumn({ name: 'receiverUserId' })
  receiverUser: User;
}