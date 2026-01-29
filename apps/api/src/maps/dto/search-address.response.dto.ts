import { ApiProperty } from '@nestjs/swagger';

export class SearchAddressMetaDto {
  @ApiProperty({ description: '총 결과 수', example: 1 })
  totalCount: number;
}

export class SearchAddressDataDto {
  @ApiProperty({
    description: '장소명/검색 제목',
    example: '<b>강남</b>구청',
  })
  title: string;

  @ApiProperty({
    description: '도로명 주소',
    example: '서울특별시 강남구 학동로 426 강남구청',
  })
  roadAddress: string;

  @ApiProperty({
    description: '지번 주소',
    example: '서울특별시 강남구 삼성동 16-1 강남구청',
  })
  jibunAddress: string;

  @ApiProperty({ description: '위도', example: '37.5173050' })
  latitude: string;

  @ApiProperty({ description: '경도', example: '127.0475020' })
  longitude: string;
}

export class SearchAddressResponseDto {
  @ApiProperty({ description: '메타 정보', type: SearchAddressMetaDto })
  meta: SearchAddressMetaDto;

  @ApiProperty({ description: '주소 목록', type: [SearchAddressDataDto] })
  addresses: SearchAddressDataDto[];
}
