import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Controller('deposits')
@UseGuards(JwtAuthGuard)
export class DepositsController {
    constructor(private readonly depositsService: DepositsService) {}

    @Post()
    async createDeposit(
        @GetUser() user: User,
        @Body() body: CreateDepositDto
    ) {
        return this.depositsService.createDeposit(user.id, body); // Example amount
    }
}
