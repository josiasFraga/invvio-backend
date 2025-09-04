import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notification_motives')
export class NotificationMotive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  motive: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;
}
