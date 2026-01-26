import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchRecordsDto {
  @ApiProperty({
    description: '검색 키워드 (제목, 본문, 장소, 태그 검색)',
    example: '롯데월드',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  keyword: string;

  @ApiPropertyOptional({
    description: '필터링할 태그 목록',
    example: ['놀이공원', '여행'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }): string[] =>
    Array.isArray(value) ? (value as string[]) : [String(value)],
  )
  tags?: string[];

  @ApiPropertyOptional({
    description: '이미지 포함 여부 필터',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value == 'true' || value == true || value === '1')
  hasImage = false;

  @ApiPropertyOptional({
    description: '즐겨찾기 기록만 보기 필터',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  isFavorite = false;

  @ApiPropertyOptional({
    description: '다음 페이지 조회를 위한 커서 (Base64 인코딩 문자열)',
    example: 'WzE3MDQ4MTI0MDAwMDAsIDEwMjRd',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: '한 번에 조회할 아이템 개수',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  size?: number;
}
