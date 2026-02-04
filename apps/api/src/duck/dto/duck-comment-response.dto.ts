import { ApiProperty } from '@nestjs/swagger';

export class DuckCommentResponseDto {
  @ApiProperty({
    description: '오리가 반환하는 코멘트 10개',
    example: [
      '오늘도 기록은 네가 해야지, 내가 할 순 없다.',
      '이렇게 가만히 있다가, 기록 다 놓친다.',
      '등등 10개',
    ],
  })
  comments: string[];

  constructor(comments: string[]) {
    this.comments = comments;
  }

  static of(comments: string[]): DuckCommentResponseDto {
    return new DuckCommentResponseDto(comments);
  }
}
