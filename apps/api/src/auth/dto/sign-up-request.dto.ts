import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpRequest {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: '비밀번호는 영문자와 숫자를 포함해야 합니다.',
  })
  password: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}
