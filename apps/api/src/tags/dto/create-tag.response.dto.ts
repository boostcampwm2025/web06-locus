export class CreateTagResponseDto {
  tag!: TagDto;
}

export class TagDto {
  id!: string;
  name!: string;
  isSystem!: boolean;
}
