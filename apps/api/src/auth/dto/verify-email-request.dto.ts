import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailRequest {
  @ApiProperty({
    example: 'user@gmail.com',
    description: '사용자 이메일 (로그인 ID)',
    required: true,
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6자리 인증코드',
    required: true,
  })
  @IsString()
  @Length(6, 6, { message: '인증코드는 6자입니다.' })
  code: string;
}
