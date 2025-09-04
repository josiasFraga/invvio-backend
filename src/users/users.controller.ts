import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
  BadRequestException,
  NotFoundException,
  Put,
  UseInterceptors,
  UploadedFiles,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        nickname: 'johndoe',
        email: 'john@example.com',
        wallet: '0x123...',
        photoUrl: 'https://example.com/photo.jpg',
        balance: 100.50,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async getProfile(@GetUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get current user balance' })
  @ApiResponse({
    status: 200,
    description: 'User balance retrieved successfully',
    schema: {
      example: 100.50
    },
  })
  async getBalance(@GetUser() user: User) {
    return this.usersService.getBalance(user.id);
  }

  @Get('data')
  @ApiOperation({ summary: 'Get current user data' })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        nickname: 'johndoe',
        wallet: '0x123...',
        photoUrl: 'https://example.com/photo.jpg',
      },
    },
  })
  async getData(
    @Query('userId') userId: string
  ) {

    if ( !userId ) {
      throw new BadRequestException('userId query parameter is required');
    }
    const userData = await this.usersService.findOne(userId);

    if ( !userData ) {
      throw new NotFoundException('User not found');
    }
  
    return {
      id: userData.id,
      nickname: userData.nickname,
      wallet: userData.wallet,
      photoUrl: userData.photoUrl,
    };
  }

  @Put('me/photo')
  @ApiOperation({ summary: 'Update user photo URL' })
  @ApiResponse({
    status: 200,
    description: 'Photo URL updated successfully',
    schema: {
      example: {
        id: 'uuid',
        nickname: 'johndoe',
        email: 'john@example.com',
        wallet: '0x123...',
        photoUrl: 'https://example.com/new-photo.jpg',
        balance: 100.50,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @UseInterceptors(FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
  ]))
  async updatePhoto(
    @GetUser() user: User,
    @UploadedFiles()
    files: {
        photo?: Express.Multer.File[];
    },
  ) {
    
    const fileImg = files?.photo?.[0];

    if ( !fileImg ) {
      throw new BadRequestException('Photo file is required');
    }
  
    let uploadedImg: any = null;
		uploadedImg = await this.uploadService.uploadAndProcess(
      fileImg,
      'users',
      true, // round = true (se quiser foto redonda no thumb)
		);

		const photoUrl = uploadedImg.originalUrl;

    return this.usersService.updatePhoto(user.id, { photoUrl });
  }

  @Patch('me/wallet')
  @ApiOperation({ summary: 'Update user wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Wallet address updated successfully',
    schema: {
      example: {
        id: 'uuid',
        nickname: 'johndoe',
        email: 'john@example.com',
        wallet: '0xnewwallet...',
        photoUrl: 'https://example.com/photo.jpg',
        balance: 100.50,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Wallet already in use',
  })
  async updateWallet(
    @GetUser() user: User,
    @Body() updateWalletDto: UpdateWalletDto,
  ) {
    return this.usersService.updateWallet(user.id, updateWalletDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by nickname, email or wallet' })
  @ApiResponse({
    status: 200,
    description: 'Users found',
    schema: {
      example: [
        {
          id: 'uuid',
          nickname: 'johndoe',
          wallet: '0x123...',
          photoUrl: 'https://example.com/photo.jpg',
        },
        {
          id: 'uuid2',
          nickname: 'janedoe',
          wallet: '0x456...',
          photoUrl: 'https://example.com/photo2.jpg',
        },
      ],
    },
  })
  async searchUsers(
    @GetUser() user: User,
    @Query('query') query: string
  ) {
    if (!query) {
      return [];
    }
    return this.usersService.searchUsers(user.id, query);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@GetUser() user: User, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, changePasswordDto.password);
  }

  @Post('me/notifications-id')
  @ApiOperation({ summary: 'Save user notification ID' })
  @ApiResponse({ status: 201, description: 'Notification ID saved successfully' })
  async saveNotificationId(@GetUser() user: User, @Body() body: { notificationId: string }) {
    return this.usersService.saveNotificationId(user.id, body.notificationId);
  }
}