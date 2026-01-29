import { ApiProperty } from '@nestjs/swagger';

export class UpdateFavoriteResponseDto {
  @ApiProperty({ description: '기록 공개 ID', example: 'rec_7K9mP2nQ5xL' })
  publicId: string;

  @ApiProperty({ description: '즐겨찾기 여부', example: true })
  isFavorite: boolean;
}
