import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserNotification } from './entities/user-notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    async findAll(
        @GetUser() user: User,
        @Query() query: { limit?: number; offset?: number; read?: string },
    ): Promise<UserNotification[]> {
        return this.notificationsService.findAll(user.id, query);
    }
}
