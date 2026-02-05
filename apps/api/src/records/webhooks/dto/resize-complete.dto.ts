import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageMetadataDto {
  @IsInt()
  @Min(1)
  width: number;

  @IsInt()
  @Min(1)
  height: number;

  @IsInt()
  @Min(1)
  size: number;
}

class ImageUrlsDto {
  @IsString()
  @IsNotEmpty()
  original: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  medium: string;
}

class ImageMetadataSetDto {
  @ValidateNested()
  @Type(() => ImageMetadataDto)
  original: ImageMetadataDto;

  @ValidateNested()
  @Type(() => ImageMetadataDto)
  thumbnail: ImageMetadataDto;

  @ValidateNested()
  @Type(() => ImageMetadataDto)
  medium: ImageMetadataDto;
}

export class ResizeCompleteDto {
  @IsString()
  @IsNotEmpty()
  recordPublicId: string;

  @IsString()
  @IsNotEmpty()
  imageId: string;

  @ValidateNested()
  @Type(() => ImageUrlsDto)
  urls: ImageUrlsDto;

  @ValidateNested()
  @Type(() => ImageMetadataSetDto)
  metadata: ImageMetadataSetDto;
}
