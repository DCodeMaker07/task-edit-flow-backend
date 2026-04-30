import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('Auth')
@ApiExtraModels(RegisterDto, LoginDto, AuthResponseDto)
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account and receive a JWT token',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          password: 'securePassword123',
          name: 'John Doe',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
    example: {
      success: true,
      data: {
        id: 'uuid-123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'DEVELOPER',
        avatarUrl: 'https://example.com/avatar.jpg',
        access_token: 'eyJhbGc...',
      },
      message: 'User registered successfully',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or email already exists',
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<any> {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
      message: 'User registered successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password, receive JWT token',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          password: 'securePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
    example: {
      success: true,
      data: {
        id: 'uuid-123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'DEVELOPER',
        avatarUrl: 'https://example.com/avatar.jpg',
        access_token: 'eyJhbGc...',
      },
      message: 'Login successful',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<any> {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }
}
