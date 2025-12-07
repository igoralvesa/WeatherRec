import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CepService {
  async validateCep(cep: string): Promise<void> {
    // Normaliza: remove traço e outros caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    // Valida formato básico (deve ter 8 dígitos)
    if (cleanCep.length !== 8) {
      throw new BadRequestException('CEP deve conter 8 dígitos.');
    }

    const url = `https://viacep.com.br/ws/${cleanCep}/json/`;

    try {
      const { data } = await axios.get(url, {
        timeout: 15000,
        validateStatus: (status) => status < 500,
        headers: {
          'User-Agent': 'GDash-API/1.0',
        },
      });

      if (data.erro || !data.cep) {
        throw new BadRequestException('CEP não encontrado.');
      }
    } catch (error: any) {
      // Se já for uma BadRequestException, re-lança
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Se for erro de timeout ou conexão, lança erro mais específico
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new BadRequestException('Timeout ao validar CEP. Tente novamente.');
      }
      
      // Se for erro de resposta HTTP (4xx, 5xx)
      if (error.response) {
        const status = error.response.status;
        if (status >= 500) {
          throw new BadRequestException('Serviço de validação de CEP temporariamente indisponível. Tente novamente.');
        }
        throw new BadRequestException('Erro ao validar CEP. Tente novamente.');
      }
      
      // Erro de conexão (sem resposta)
      if (error.request) {
        throw new BadRequestException('Erro ao conectar com serviço de validação de CEP. Verifique sua conexão.');
      }
      
      // Outros erros
      throw new BadRequestException('Erro ao validar CEP. Tente novamente.');
    }
  }
}

