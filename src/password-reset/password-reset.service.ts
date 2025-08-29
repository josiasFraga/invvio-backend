import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async requestReset(requestResetDto: RequestResetDto): Promise<void> {
    const { email } = requestResetDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = uuidv4();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const passwordResetToken = this.passwordResetTokenRepository.create({
      userId: user.id,
      token,
      code,
      expiresAt,
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);
    console.log(`Reset link: ${process.env.APP_URL}/reset-password?token=${token}`);
    console.log(`Reset code: ${code}`);
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<boolean> {
    const { token, code } = verifyCodeDto;
    const resetToken = await this.passwordResetTokenRepository.findOne({ where: { token, code } });
    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.usedAt) {
      throw new NotFoundException('Invalid or expired token');
    }
    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, code, newPassword } = resetPasswordDto;
    const resetToken = await this.passwordResetTokenRepository.findOne({ where: { token, code } });
    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.usedAt) {
      throw new NotFoundException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({ where: { id: resetToken.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    resetToken.usedAt = new Date();

    await this.userRepository.save(user);
    await this.passwordResetTokenRepository.save(resetToken);
  }
}
