import { IsNumber, IsOptional, Min, Max, IsIn } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetRecordsByLocationDto {
  @ApiProperty({
    description: '중심 좌표의 위도',
    example: 37.5219,
    minimum: -90,
    maximum: 90,
  })
  @Transform(({ value }: TransformFnParams) => parseFloat(value as string))
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: '중심 좌표의 경도',
    example: 127.0411,
    minimum: -180,
    maximum: 180,
  })
  @Transform(({ value }: TransformFnParams) => parseFloat(value as string))
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    description: '검색 반경 (미터 단위)',
    example: 10,
    minimum: 5,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value ? parseInt(value as string, 10) : 10,
  )
  @IsNumber()
  @Min(5)
  @Max(50)
  radius = 10;

  @ApiPropertyOptional({
    description: '페이지당 기록 수',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value ? parseInt(value as string, 10) : 10,
  )
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({
    description: '페이지 번호 (1부터 시작)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value ? parseInt(value as string, 10) : 1,
  )
  @IsNumber()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: '정렬 순서 (desc: 최신순, asc: 오래된순)',
    example: 'desc',
    enum: ['desc', 'asc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['desc', 'asc'])
  sortOrder: 'desc' | 'asc' = 'desc';
}
