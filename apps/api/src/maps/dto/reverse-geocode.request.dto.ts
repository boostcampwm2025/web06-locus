import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class ReverseGeocodeRequestDto {
  @ApiProperty({
    description: '위도',
    example: 37.5219,
    minimum: -90,
    maximum: 90,
  })
  @Transform(({ value }) => parseFloat(value as string))
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
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
