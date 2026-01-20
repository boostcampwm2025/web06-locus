import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'name은 빈 문자열일 수 없습니다.' })
  @MaxLength(5, { message: 'name은 최대 5자까지 가능합니다.' })
  name!: string;
}
