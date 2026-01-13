import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({
    example: 'user@gmail.com',
    description: '로그인용 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '로그인 비밀번호 (영문, 숫자 포함 8자 이상)',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: '비밀번호는 영문자와 숫자를 포함해야 합니다.',
  })
  password: string;
}
