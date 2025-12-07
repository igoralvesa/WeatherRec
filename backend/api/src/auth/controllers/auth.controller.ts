import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User, UserDocument } from '../../users/schemas/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async register(@Body() registerDto: RegisterDto): Promise<Omit<User, 'password_hash'>> {
    const user = await this.authService.register(registerDto);
    
    // Remover password_hash da resposta e transformar timestamps
    const userObject = user.toObject ? user.toObject() : user;
    const { password_hash, _id, createdAt, updatedAt, ...userResponse } = userObject;
    return {
      ...userResponse,
      id: _id?.toString() || user._id?.toString(),
      created_at: createdAt,
      updated_at: updatedAt,
    } as Omit<User, 'password_hash'>;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMe(@GetUser() user: UserDocument): Promise<Omit<User, 'password_hash'>> {
    // Remover password_hash da resposta e transformar timestamps e _id
    const { password_hash, _id, createdAt, updatedAt, ...userResponse } = user.toObject();
    return {
      ...userResponse,
      id: _id?.toString() || user._id?.toString(),
      created_at: createdAt,
      updated_at: updatedAt,
    } as Omit<User, 'password_hash'>;
  }
}

