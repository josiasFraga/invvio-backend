import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Injectable()
export class DepositsService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async createDeposit(userId: string, body: CreateDepositDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
    
        if (!user) {
            throw new Error('User not found');
        }

        try {
            const currentBalance = Number(user.balance) || 0;
            user.balance = Number((currentBalance + body.amount).toFixed(8));
            await this.userRepository.save(user);

        } catch (error) {
            console.error('Error creating deposit:', error);
            throw new InternalServerErrorException('Error creating deposit');
        }
        
    }
}
