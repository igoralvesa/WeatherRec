import { Injectable, OnModuleInit, Logger, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    await this.createDefaultUser();
  }

  private async createDefaultUser() {
    const defaultEmail = 'user@example.com';
    const defaultPassword = 'user123';
    const defaultName = 'Usuário Padrão';
    const defaultCep = '50030903'; // CEP de Recife - PE

    try {
      // Verificar se o usuário já existe
      const existingUser = await this.userService.findByEmail(defaultEmail);
      
      if (existingUser) {
        this.logger.log(`Usuário padrão já existe: ${defaultEmail}`);
        return;
      }

      // Criar usuário padrão
      await this.userService.create(
        defaultName,
        defaultEmail,
        defaultPassword,
        defaultCep,
      );

      this.logger.log('✅ Usuário padrão criado com sucesso!');
      this.logger.log(`   Email: ${defaultEmail}`);
      this.logger.log(`   Senha: ${defaultPassword}`);
    } catch (error) {
      // Se for erro de conflito (usuário já existe), apenas loga
      if (error instanceof ConflictException || (error.message && error.message.includes('já está em uso'))) {
        this.logger.log(`Usuário padrão já existe: ${defaultEmail}`);
        return;
      }
      
      // Para outros erros, loga mas não bloqueia a inicialização
      this.logger.warn(`Erro ao criar usuário padrão: ${error.message || error}`);
    }
  }
}

