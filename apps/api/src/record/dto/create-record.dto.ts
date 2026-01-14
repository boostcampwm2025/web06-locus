import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty({ message: '제목은 필수 항목입니다.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용은 필수 항목입니다.' })
  content: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
