import { ApiProperty } from '@nestjs/swagger';

export class GeocodeMetaDto {
  @ApiProperty({ description: '총 결과 수', example: 1 })
  totalCount: number;

  @ApiProperty({ description: '페이지 번호', example: 1 })
  page: number;

  @ApiProperty({ description: '현재 페이지 결과 수', example: 1 })
  count: number;
}

export class AddressDataDto {
  @ApiProperty({
    description: '도로명 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  roadAddress: string;

  @ApiProperty({
    description: '지번 주소',
    example: '서울특별시 강남구 역삼동 123-45',
  })
  jibunAddress: string;

  @ApiProperty({
    description: '영문 주소',
    example: '123, Teheran-ro, Gangnam-gu, Seoul',
  })
  englishAddress: string;

  @ApiProperty({ description: '위도', example: '37.5219' })
  latitude: string;

  @ApiProperty({ description: '경도', example: '127.0411' })
  longitude: string;
}

export class GeocodeResponseDto {
  @ApiProperty({ description: '메타 정보', type: GeocodeMetaDto })
  meta: GeocodeMetaDto;

  @ApiProperty({ description: '주소 목록', type: [AddressDataDto] })
  addresses: AddressDataDto[];
}
