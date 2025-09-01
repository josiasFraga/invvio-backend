import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user.passwordHash;
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    return user;
  }

  async updatePhoto(userId: string, updatePhotoDto: UpdatePhotoDto): Promise<User> {
    const user = await this.findOne(userId);
    user.photoUrl = updatePhotoDto.photoUrl;
    await this.usersRepository.save(user);
    delete user.passwordHash;
    return user;
  }

  async updateWallet(userId: string, updateWalletDto: UpdateWalletDto): Promise<User> {
    const user = await this.findOne(userId);
    
    // Verificar se a wallet já está em uso
    const existingWallet = await this.usersRepository.findOne({
      where: { wallet: updateWalletDto.wallet },
    });

    if (existingWallet && existingWallet.id !== userId) {
      throw new ConflictException('Wallet already in use');
    }

    user.wallet = updateWalletDto.wallet;
    await this.usersRepository.save(user);
    delete user.passwordHash;
    return user;
  }

  async searchUsers(userId: string, query: string): Promise<Partial<User>[]> {
    const q = `%${query}%`;

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname', 'u.wallet', 'u.photoUrl'])
      .where('u.id != :userId', { userId })
      .andWhere(
        '(u.nickname LIKE :q OR u.email LIKE :q OR u.wallet LIKE :q)',
        { q },
      )
      .limit(20)
      .getMany();

    return users.map(u => ({
      id: u.id,
      nickname: u.nickname,
      wallet: u.wallet,
      photoUrl: u.photoUrl,
    }));
  }

  async updateBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    user.balance = Number(user.balance) + amount;
    await this.usersRepository.save(user);
    delete user.passwordHash;
    return user;
  }

  async getBalance(userId: string): Promise<number> {
    const user = await this.findOne(userId);
    return Number(user.balance);
  }
}