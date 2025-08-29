
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('email-validation-codes')
export class EmailValidationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'datetime' })
  expires: Date;
}
