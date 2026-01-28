export class DeleteConnectionResponseDto {
  deleted: DeletedConnectionDto;
}

export interface DeletedConnectionDto {
  publicId: string;
  pairPublicId: string;
}
