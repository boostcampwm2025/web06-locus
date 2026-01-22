import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class ReverseGeocodeRequestDto {
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
