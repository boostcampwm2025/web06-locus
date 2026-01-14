import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateConnectionRequestDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  fromRecordPublicId!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  toRecordPublicId!: string;
}
