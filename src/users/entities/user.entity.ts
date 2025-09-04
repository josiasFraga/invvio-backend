import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Transfer } from '../../transfers/entities/transfer.entity';
import { PasswordResetToken } from '../../password-reset/entities/password-reset-token.entity';
import { Exclude } from 'class-transformer';
import { NotificationId } from '../../notifications/entities/notification-id.entity';
import { UserNotification } from '../../notifications/entities/user-notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ unique: true, nullable: true })
  wallet: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transfer, (transfer) => transfer.senderUser)
  sentTransfers: Transfer[];

  @OneToMany(() => Transfer, (transfer) => transfer.receiverUser)
  receivedTransfers: Transfer[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => NotificationId, (notification) => notification.user)
  notificationIds: NotificationId[];

  @OneToMany(() => UserNotification, (notification) => notification.user)
  userNotifications: UserNotification[];

  @OneToMany(() => UserNotification, (notification) => notification.originUser)
  originatedNotifications: UserNotification[];

  @BeforeInsert()
  @BeforeUpdate()
  emailToLowerCase() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}