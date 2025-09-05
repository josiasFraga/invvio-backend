import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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

    @Get('count-not-read')
    async countNotRead(
        @GetUser() user: User,
    ): Promise<number> {
        return this.notificationsService.countNotRead(user.id);
    }

    @Post('mark-as-read/:notificationId')
    async markAsRead(
        @GetUser() user: User,
        @Param('notificationId') notificationId: string,
    ): Promise<{ status: string; message: string }> {
        return this.notificationsService.setAsRead(user.id, notificationId);
    }
}