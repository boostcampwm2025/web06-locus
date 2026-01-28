import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GeocodeRequestDto {
  @ApiProperty({
    description: '검색할 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  address: string;
}
