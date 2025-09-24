import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 'uuid',
          nickname: 'johndoe',
          email: 'john@example.com',
          wallet: null,
          photoUrl: null,
          balance: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        accessToken: 'jwt-token',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email or nickname already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        user: {
          id: 'uuid',
          nickname: 'johndoe',
          email: 'john@example.com',
          wallet: '0x123...',
          photoUrl: 'https://example.com/photo.jpg',
          balance: 100.50,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        accessToken: 'jwt-token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('validate-payid')
  @ApiOperation({ summary: 'Validate if a payId is available' })
  @ApiQuery({ name: 'payId', required: true, description: 'Public identifier to validate' })
  @ApiResponse({
    status: 200,
    description: 'Availability result',
    schema: { example: { available: true } },
  })
  @ApiResponse({ status: 400, description: 'Public ID already in use or invalid' })
  async validatePayId(@Query('payId') payId?: string) {
    console.log(payId);
    if (!payId || !payId.trim()) {
      throw new BadRequestException('payId is required');
    }
    const { available } = await this.authService.checkPayIdAvailability(payId);

    console.log(available);
    if (!available) {
      throw new BadRequestException('Public ID already in use');
    }
    return { available: true };
  }
}