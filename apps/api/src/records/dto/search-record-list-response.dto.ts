import { ApiProperty } from '@nestjs/swagger';
import { RecordSyncPayload } from '../type/record-sync.types';
import { SearchHit } from 'node_modules/@elastic/elasticsearch/lib/api/types';

export class SearchRecordItemDto {
  @ApiProperty({
    description: '기록 공개 ID',
    example: 'X8Na9FowSZns',
  })
  recordId: string;

  @ApiProperty({
    description: '기록 제목',
    example: '강남역 맛집 탐방',
  })
  title: string;

  @ApiProperty({
    description: '태그 목록',
    example: ['맛집', '여행'],
  })
  tags: string[];

  @ApiProperty({
    description: '장소 이름',
    example: '강남역',
    nullable: true,
  })
  locationName: string | null;

  @ApiProperty({
    description: '즐겨찾기 여부',
    example: true,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://...',
    nullable: true,
  })
  thumbnailImage: string | null;

  @ApiProperty({
    description: '해당 기록과 연결된 기록 개수',
    example: 3,
  })
  connectionCount: number;

  @ApiProperty({
    description: '생성 시간',
    example: '2026-01-09T10:00:00Z',
  })
  createdAt: string;
}

export class SearchPaginationDto {
  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasMore: boolean;

  @ApiProperty({
    description: '다음 페이지 조회를 위한 커서 (Base64)',
    example: 'WzE3MDQ4MTI0MDAwMDAsIDEwMjRd',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: '검색된 전체 결과 수',
    example: 100,
  })
  totalCount: number;
}

export class SearchRecordListResponseDto {
  @ApiProperty({ type: [SearchRecordItemDto] })
  records: SearchRecordItemDto[];

  @ApiProperty({ type: SearchPaginationDto })
  pagination: SearchPaginationDto;

  static of(
    hits: SearchHit<RecordSyncPayload>[],
    hasMore: boolean,
    nextCursor: string | null,
    totalCount: number,
  ): SearchRecordListResponseDto {
    return {
      records: hits.map((hit): SearchRecordItemDto => {
        const source = hit._source!;

        return {
          recordId: source.publicId,
          title: source.title,
          tags: source.tags ?? [],
          locationName: source.locationName ?? null,
          isFavorite: source.isFavorite,
          thumbnailImage: source.thumbnailImage ?? null,
          connectionCount: source.connectionsCount ?? 0,
          createdAt: source.createdAt,
        };
      }),
      pagination: {
        hasMore,
        nextCursor,
        totalCount,
      },
    };
  }
}
