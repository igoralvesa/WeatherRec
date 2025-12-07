import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { User, UserDocument } from '../schemas/user.schema';
import { CepService } from './cep.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cepService: CepService,
  ) {}

  async create(name: string, email: string, password: string, cep: string): Promise<UserDocument> {
    // Validar CEP com ViaCEP (não bloqueante - se falhar por problemas de rede, apenas ignora)
    try {
      await this.cepService.validateCep(cep);
    } catch (error) {
      // Se for erro de timeout ou conexão, apenas ignora mas não bloqueia o registro
      // Isso permite que o registro funcione mesmo se a API ViaCEP estiver indisponível
      if (!(error instanceof BadRequestException && 
          (error.message.includes('Timeout') || error.message.includes('conectar')))) {
        // Se for erro de formato ou CEP inválido, lança o erro normalmente
        throw error;
      }
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso.');
    }

    // Hash da senha
    const saltRounds = process.env.NODE_ENV === 'production' ? 10 : 4;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Normalizar CEP (remover traço)
    const normalizedCep = cep.replace(/\D/g, '');

    // Criar usuário
    const user = await this.userRepository.create({
      name,
      email,
      password_hash,
      cep: normalizedCep,
      role: 'user',
    });
    
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    // Se estiver atualizando CEP, validar (não bloqueante se houver problemas de rede)
    if (updateData.cep) {
      try {
        await this.cepService.validateCep(updateData.cep);
      } catch (error) {
        // Se for erro de timeout ou conexão, apenas ignora mas não bloqueia a atualização
        if (!(error instanceof BadRequestException && 
            (error.message.includes('Timeout') || error.message.includes('conectar')))) {
          // Se for erro de formato ou CEP inválido, lança o erro normalmente
          throw error;
        }
      }
      // Normalizar CEP
      updateData.cep = updateData.cep.replace(/\D/g, '');
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado.');
    }
  }

  async validatePassword(password: string, password_hash: string): Promise<boolean> {
    return bcrypt.compare(password, password_hash);
  }
}

