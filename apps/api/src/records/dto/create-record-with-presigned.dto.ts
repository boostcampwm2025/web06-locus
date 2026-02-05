import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationDto } from './create-record.dto';

export class CreateRecordWithPresignedDto {
  @ApiProperty({
    description: 'Presigned URL 응답에서 받은 Record 공개 ID',
    example: 'rec_a1b2c3d4e5f6',
  })
  @IsString()
  @IsNotEmpty()
  recordPublicId: string;

  @ApiProperty({
    description: '업로드한 이미지 ID 배열',
    example: ['img_001abc', 'img_002def', 'img_003ghi'],
    type: [String],
    minItems: 1,
    maxItems: 5,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  imageIds: string[];

  @ApiProperty({
    description: '기록 제목',
    example: '제주도 여행',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: '기록 내용',
    example: '아름다운 제주도',
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
    description: '태그 공개 ID 목록',
    example: ['tag_pQ2x9mL7kV1a', 'tag_a7K9mP2nQ5xL'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
