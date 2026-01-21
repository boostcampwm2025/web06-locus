import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetRecordsQueryDto {
  @ApiProperty({
    description: '북동쪽 모서리 위도',
    example: 37.5,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  neLat: number;

  @ApiProperty({
    description: '북동쪽 모서리 경도',
    example: 127.1,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  neLng: number;

  @ApiProperty({
    description: '남서쪽 모서리 위도',
    example: 37.4,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  swLat: number;

  @ApiProperty({
    description: '남서쪽 모서리 경도',
    example: 127.0,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  swLng: number;

  @ApiPropertyOptional({
    description: '페이지 번호 (1부터 시작)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page = 1;

  @ApiPropertyOptional({
    description: '조회할 기록 개수',
    example: 10,
    default: 10,
    minimum: 10,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  @Type(() => Number)
  limit = 10;

  @ApiPropertyOptional({
    description: '정렬 순서 (desc: 최신순, asc: 오래된순)',
    example: 'desc',
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
