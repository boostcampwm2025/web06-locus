import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class GenerateUploadUrlsRequestDto {
  @ApiProperty({
    description: '업로드할 이미지 개수',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  count: number;
}

export class UploadUrlDto {
  @ApiProperty({
    description: '이미지 고유 ID',
    example: 'img_a1b2c3d4e5f6',
  })
  imageId: string;

  @ApiProperty({
    description: 'Presigned URL (만료: 1시간)',
    example:
      'https://kr.object.ncloudstorage.com/locus/records/user123/rec_abc/img001/original.jpg?X-Amz-Algorithm=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'Object Storage 키 (참고용)',
    example: 'records/user123/rec_abc/img001/original.jpg',
  })
  key: string;
}

export class GenerateUploadUrlsResponseDto {
  @ApiProperty({
    description: '미리 생성된 Record 공개 ID',
    example: 'rec_a1b2c3d4e5f6',
  })
  recordPublicId: string;

  @ApiProperty({
    description: '업로드 URL 목록',
    type: [UploadUrlDto],
  })
  uploads: UploadUrlDto[];
}
