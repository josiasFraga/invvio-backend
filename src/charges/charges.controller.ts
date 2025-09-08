import { Controller, Post, Body, UseGuards, Get, Query, Param } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateChargeDto } from './dto/create-charge.dto';
import { ListChargesDto } from './dto/list-charges.dto';

@Controller('charges')
export class ChargesController {
	constructor(private readonly chargesService: ChargesService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	async create(@GetUser() user: User, @Body() dto: CreateChargeDto) {
		return this.chargesService.createCharge(user.id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	async list(@GetUser() user: User, @Query() query: ListChargesDto) {
		return this.chargesService.listCharges(user.id, { limit: query.limit, offset: query.offset });
	}

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
	async findOne(@GetUser() user: User, @Param('id') id: string) {
		return this.chargesService.findChargeById(user.id, id);
	}
}
