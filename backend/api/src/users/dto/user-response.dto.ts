import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID do usuário' })
  id: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'Email do usuário' })
  email: string;

  @ApiProperty({ example: '01310-100', description: 'CEP do usuário' })
  cep: string;

  @ApiProperty({ example: 'user', description: 'Role do usuário', default: 'user' })
  role: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: 'Data de criação' })
  created_at: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: 'Data de atualização' })
  updated_at: Date;
}

