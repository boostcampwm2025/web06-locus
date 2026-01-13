import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '서비스 접근을 위한 JWT 액세스 토큰',
  })
  accessToken: string;
}
