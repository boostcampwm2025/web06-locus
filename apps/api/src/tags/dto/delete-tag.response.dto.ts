import { ApiProperty } from '@nestjs/swagger';
export class DeletedTagDto {
  @ApiProperty({
    example: 'tag_A1b2C3',
    description: '삭제된 태그 public id',
  })
  publicId: string;
}
export class DeleteTagResponseDto {
  @ApiProperty({ type: DeletedTagDto })
  deleted: DeletedTagDto;
}
