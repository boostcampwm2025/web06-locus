import { ApiProperty } from '@nestjs/swagger';

export class ReverseGeocodeResponseDto {
  @ApiProperty({
    description: '장소 이름',
    example: '스타벅스 강남점',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: '주소',
    example: '서울특별시 강남구 테헤란로 123',
    nullable: true,
  })
  address: string | null;
}
