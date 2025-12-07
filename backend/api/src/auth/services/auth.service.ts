import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/services/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const { name, email, password, cep } = registerDto;
    const user = await this.userService.create(name, email, password, cep);
    return user as UserDocument;
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user as UserDocument;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);
    const expires_in = this.configService.get<string>('jwt.expiresIn') || '7d';

    return { access_token, expires_in };
  }

  async validateJwtPayload(payload: any): Promise<UserDocument> {
    const user = await this.userService.findById(payload.sub);
    return user as UserDocument;
  }
}

