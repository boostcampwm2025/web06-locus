export class DeleteConnectionResponseDto {
  deleted: deletedConnectionDto;
}

export interface deletedConnectionDto {
  publicId: string;
  pairPublicId: string;
}
