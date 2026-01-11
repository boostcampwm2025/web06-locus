import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailRequest {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  email: string;

  @IsString()
  @Length(6, 6, { message: '인증코드는 6자입니다.' })
  code: string;
}
