import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateFavoriteDto {
  @ApiProperty({ description: '즐겨찾기 여부', example: true })
  @IsBoolean()
  isFavorite: boolean;
}
