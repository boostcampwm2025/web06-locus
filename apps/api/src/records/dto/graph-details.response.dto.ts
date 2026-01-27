import { ApiProperty } from '@nestjs/swagger';
import { RecordRowType } from '../type/record.type';
import { ImageSizeDto } from './record-response.dto';
/** 위치 정보 */
export class GraphRecordLocationDto {
  @ApiProperty({ example: 37.5219, description: '위도' })
  latitude: number;

  @ApiProperty({ example: 127.0411, description: '경도' })
  longitude: number;

  @ApiProperty({ example: '한강공원', description: '장소 이름' })
  name: string;

  @ApiProperty({
    example: '서울특별시 강남구 삼성동',
    description: '주소',
  })
  address: string;
}

/** 태그 */
export class GraphRecordTagDto {
  @ApiProperty({ example: 'tag_test_2001', description: '태그 publicId' })
  publicId: string;

  @ApiProperty({ example: '운동', description: '태그 이름' })
  name: string;
}

/** 인접 기록(Depth=1) */
export class GraphRecordDto {
  @ApiProperty({ example: 'rec_9Nx8Q4wR1zM', description: '기록 publicId' })
  publicId: string;

  @ApiProperty({ example: '카페에서 작업', description: '기록 제목' })
  title: string;

  @ApiProperty({ type: GraphRecordLocationDto })
  location: GraphRecordLocationDto;

  @ApiProperty({ type: [GraphRecordTagDto] })
  tags: GraphRecordTagDto[];

  @ApiProperty({ type: ImageSizeDto, nullable: true })
  thumbnail: ImageSizeDto | null;

  @ApiProperty({
    example: '2024-01-14T10:20:00Z',
    description: '생성 시각',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-14T10:20:00Z',
    description: '수정 시각',
  })
  updatedAt: string;

  static Of(
    record: RecordRowType,
    tags: { tagPublicId: string; tagName: string }[],
  ): GraphRecordDto {
    return {
      publicId: record.publicId,
      title: record.title,
      location: {
        latitude: record.latitude!,
        longitude: record.longitude!,
        name: record.locationName!,
        address: record.locationAddress!,
      },
      tags: tags.map((tag) => ({
        publicId: tag.tagPublicId,
        name: tag.tagName,
      })),
      thumbnail: record.thumbnailUrl
        ? {
            url: record.thumbnailUrl,
            width: record.thumbnailWidth!,
            height: record.thumbnailHeight!,
            size: record.thumbnailSize!,
          }
        : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}

/** data 영역 */
export class GraphNeighborRecordsDto {
  @ApiProperty({
    example: 'rec_7K9mP2nQ5xL',
    description: '기준 기록 publicId',
  })
  start: string;

  @ApiProperty({
    example: 1,
    description: '그래프 탐색 깊이 (고정값)',
  })
  depth: number;

  @ApiProperty({ type: [GraphRecordDto] })
  records: GraphRecordDto[];
}
