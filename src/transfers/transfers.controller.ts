import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ListTransfersDto } from './dto/list-transfers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  //@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createTransfer(@GetUser() user: User, @Body() createTransferDto: CreateTransferDto) {
    return this.transfersService.createTransfer(user.id, createTransferDto);
  }

  @Get()
  async findTransfers(@GetUser() user: User, @Query() query: ListTransfersDto) {
    return this.transfersService.findTransfers(user.id, {
      limit: query.limit,
      offset: query.offset,
    });
  }
}
