import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({
    description: '위도',
    example: 37.5219,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: '경도',
    example: 127.0411,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class CreateRecordDto {
  @ApiProperty({
    description: '기록 제목',
    example: '한강 산책',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: '기록 내용',
    example: '날씨가 좋아서 한강을 따라 걸었다.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  content?: string;

  @ApiProperty({
    description: '위치 정보',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({
    description: '태그 목록',
    example: ['산책', '한강', '석양'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  tags?: string[];
}
