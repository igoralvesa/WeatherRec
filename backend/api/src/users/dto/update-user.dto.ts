import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '01310-100', description: 'CEP no formato XXXXX-XXX ou XXXXXXXX', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP must be in format XXXXX-XXX or XXXXXXXX' })
  cep?: string;
}

