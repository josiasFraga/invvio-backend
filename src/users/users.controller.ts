import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
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

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Patch('me/photo')
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
  async updatePhoto(
    @GetUser() user: User,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.usersService.updatePhoto(user.id, updatePhotoDto);
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
  async searchUsers(@Query('query') query: string) {
    if (!query) {
      return [];
    }
    return this.usersService.searchUsers(query);
  }
}