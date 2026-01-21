import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GeocodeRequestDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  address: string;
}
