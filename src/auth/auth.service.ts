import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
  const { nickname, email, password, payId } = registerDto;

    // Verificar se o email já existe
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Verificar se o nickname já existe
    const existingUserByNickname = await this.usersRepository.findOne({
      where: { nickname },
    });

    if (existingUserByNickname) {
      throw new ConflictException('Nickname already exists');
    }

    // Verificar se o payId já existe (usar email como fallback se não for fornecido)
    const desiredPayId = (payId ?? email).toLowerCase();
    const existingUserByPayId = await this.usersRepository.findOne({ where: { payId: desiredPayId } });
    if (existingUserByPayId) {
      throw new ConflictException('Public ID already exists');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const user = this.usersRepository.create({
      nickname,
      email: email.toLowerCase(),
      passwordHash,
      balance: 0,
  payId: desiredPayId,
    });

    await this.usersRepository.save(user);

    // Gerar token JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Remover passwordHash da resposta
    delete user.passwordHash;

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuário pelo email
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gerar token JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Remover passwordHash da resposta
    delete user.passwordHash;

    return {
      user,
      accessToken,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    delete user.passwordHash;
    return user;
  }

  async checkPayIdAvailability(payId: string): Promise<{ available: boolean }> {
    const normalized = payId.toLowerCase().trim();
    if (!normalized) {
      return { available: false };
    }
    const existing = await this.usersRepository.findOne({ where: { payId: normalized } });
    return { available: !existing };
  }
}