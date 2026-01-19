import { ApiProperty } from '@nestjs/swagger';
import { RecordModel } from '../records.types';

export class RecordLocationDto {
  @ApiProperty({ description: '위도', example: 37.5219 })
  latitude: number;

  @ApiProperty({ description: '경도', example: 127.0411 })
  longitude: number;

  @ApiProperty({
    description: '장소 이름',
    example: '광화문',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: '주소',
    example: '서울특별시 강남구 삼성동',
    nullable: true,
  })
  address: string | null;
}

export class RecordListItemDto {
  @ApiProperty({ description: '기록 공개 ID', example: 'rec_7K9mP2nQ5xL' })
  publicId: string;

  @ApiProperty({ description: '기록 제목', example: '한강 산책' })
  title: string;

  @ApiProperty({
    description: '기록 내용',
    example: '날씨가 좋아서 한강을 따라 걸었다.',
    nullable: true,
  })
  content: string | null;

  @ApiProperty({ description: '위치 정보', type: RecordLocationDto })
  location: RecordLocationDto;

  @ApiProperty({
    description: '태그 목록',
    example: ['고향', '맛집'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: '생성 시간',
    example: '2024-01-15T14:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '수정 시간',
    example: '2024-01-15T14:30:00Z',
  })
  updatedAt: string;
}

export class RecordsListResponseDto {
  @ApiProperty({
    description: '기록 목록',
    type: [RecordListItemDto],
  })
  records: RecordListItemDto[];

  @ApiProperty({
    description: '전체 기록 수',
    example: 543,
  })
  totalCount: number;

  static from(
    records: RecordModel[],
    totalCount: number,
  ): RecordsListResponseDto {
    return {
      records: records.map((r) => ({
        publicId: r.publicId,
        title: r.title,
        content: r.content,
        location: {
          latitude: r.latitude,
          longitude: r.longitude,
          name: r.locationName,
          address: r.locationAddress,
        },
        tags: r.tags,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      totalCount,
    };
  }
}
