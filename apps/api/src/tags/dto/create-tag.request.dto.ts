import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagRequestDto {
  @ApiProperty({
    example: '여행',
    description: '태그 이름 (최대 5자)',
    maxLength: 5,
  })
  @IsString()
  @IsNotEmpty({ message: 'name은 빈 문자열일 수 없습니다.' })
  @MaxLength(5, { message: 'name은 최대 5자까지 가능합니다.' })
  name!: string;
}
