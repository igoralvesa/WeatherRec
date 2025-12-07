import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT token' })
  access_token: string;

  @ApiProperty({ example: '7d', description: 'Tempo de expiração do token' })
  expires_in: string;
}

