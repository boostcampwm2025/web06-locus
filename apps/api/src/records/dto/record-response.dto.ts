import { ApiProperty } from '@nestjs/swagger';
import { RecordModel } from '../records.types';
import {
  ProcessedImage,
  UploadedImage,
} from '../services/object-storage.types';

export class ImageSizeDto {
  @ApiProperty({ description: 'URL', example: 'https://...' })
  url: string;

  @ApiProperty({ description: '너비 (px)', example: 400 })
  width: number;

  @ApiProperty({ description: '높이 (px)', example: 300 })
  height: number;

  @ApiProperty({ description: '파일 크기 (bytes)', example: 48000 })
  size: number;
}

export class ImageResponseDto {
  @ApiProperty({ description: '이미지 공개 ID', example: 'img_3Xk2P9nQ4mL' })
  publicId: string;

  @ApiProperty({ description: '썸네일 정보', type: ImageSizeDto })
  thumbnail: ImageSizeDto;

  @ApiProperty({ description: '중간 크기 정보', type: ImageSizeDto })
  medium: ImageSizeDto;

  @ApiProperty({ description: '원본 정보', type: ImageSizeDto })
  original: ImageSizeDto;

  @ApiProperty({ description: '이미지 순서', example: 0 })
  order: number;
}

export class LocationResponseDto {
  @ApiProperty({ description: '위도', example: 37.5219 })
  latitude: number;

  @ApiProperty({ description: '경도', example: 127.0411 })
  longitude: number;

  @ApiProperty({ description: '장소 이름', example: '한강공원' })
  name: string;

  @ApiProperty({
    description: '장소 주소',
    example: '서울특별시 강남구 삼성동',
  })
  address: string;
}

export class RecordResponseDto {
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

  @ApiProperty({ description: '위치 정보', type: LocationResponseDto })
  location: LocationResponseDto;

  @ApiProperty({
    description: '태그 목록',
    example: ['산책', '한강', '석양'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: '이미지 목록',
    type: [ImageResponseDto],
  })
  images: ImageResponseDto[];

  @ApiProperty({ description: '즐겨찾기 여부', example: false })
  isFavorite: boolean;

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

  static from(
    record: RecordModel,
    processedImages?: ProcessedImage[],
    uploadedImages?: UploadedImage[],
  ): RecordResponseDto {
    const images: ImageResponseDto[] = [];

    if (processedImages && uploadedImages) {
      for (let i = 0; i < processedImages.length; i++) {
        const processed = processedImages[i];
        const uploaded = uploadedImages[i];
        images.push({
          publicId: processed.imageId,
          thumbnail: {
            url: uploaded.urls.thumbnail,
            width: processed.variants.thumbnail.width,
            height: processed.variants.thumbnail.height,
            size: processed.variants.thumbnail.size,
          },
          medium: {
            url: uploaded.urls.medium,
            width: processed.variants.medium.width,
            height: processed.variants.medium.height,
            size: processed.variants.medium.size,
          },
          original: {
            url: uploaded.urls.original,
            width: processed.variants.original.width,
            height: processed.variants.original.height,
            size: processed.variants.original.size,
          },
          order: i,
        });
      }
    }

    return {
      publicId: record.publicId,
      title: record.title,
      content: record.content,
      location: {
        latitude: record.latitude,
        longitude: record.longitude,
        name: record.locationName,
        address: record.locationAddress,
      },
      tags: record.tags,
      images,
      isFavorite: record.isFavorite,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
