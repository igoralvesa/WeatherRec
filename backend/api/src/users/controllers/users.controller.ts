import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User, UserDocument } from '../schemas/user.schema';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(
    @Param('id') id: string,
    @GetUser() currentUser: UserDocument,
  ): Promise<Omit<User, 'password_hash'>> {
    // Validar que o usuário só pode acessar o próprio id
    if (currentUser._id.toString() !== id) {
      throw new ForbiddenException('Você só pode acessar seus próprios dados.');
    }

    const user = await this.userService.findById(id);
    // Remover password_hash da resposta e transformar timestamps e _id
    const { password_hash, _id, createdAt, updatedAt, ...userResponse } = user.toObject();
    return {
      ...userResponse,
      id: _id?.toString() || user._id?.toString(),
      created_at: createdAt,
      updated_at: updatedAt,
    } as Omit<User, 'password_hash'>;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: UserDocument,
  ): Promise<Omit<User, 'password_hash'>> {
    // Validar que o usuário só pode atualizar o próprio id
    if (currentUser._id.toString() !== id) {
      throw new ForbiddenException('Você só pode atualizar seus próprios dados.');
    }

    const updatedUser = await this.userService.update(id, updateUserDto);
    // Remover password_hash da resposta e transformar timestamps e _id
    const { password_hash, _id, createdAt, updatedAt, ...userResponse } = updatedUser.toObject();
    return {
      ...userResponse,
      id: _id?.toString() || updatedUser._id?.toString(),
      created_at: createdAt,
      updated_at: updatedAt,
    } as Omit<User, 'password_hash'>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(
    @Param('id') id: string,
    @GetUser() currentUser: UserDocument,
  ): Promise<void> {
    // Validar que o usuário só pode deletar o próprio id
    if (currentUser._id.toString() !== id) {
      throw new ForbiddenException('Você só pode deletar sua própria conta.');
    }

    await this.userService.delete(id);
  }
}

