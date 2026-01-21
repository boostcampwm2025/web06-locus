import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
  @ApiProperty({
    example: 'tag_A1b2C3',
    description: '태그 public id',
  })
  publicId: string;

  @ApiProperty({
    example: '여행',
    description: '태그 이름 (최대 5자)',
  })
  name: string;

  @ApiProperty({
    example: false,
    description: '시스템 태그 여부',
  })
  isSystem: boolean;
}

export class TagsResponseDto {
  @ApiProperty({ type: [TagDto] })
  tags: TagDto[];
}
