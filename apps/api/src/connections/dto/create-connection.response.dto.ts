export class CreateConnectionResponseDto {
  connection: ConnectionDto;
}

export interface ConnectionDto {
  publicId: string;
  fromRecordPublicId: string;
  toRecordPublicId: string;
  createdAt: string;
}
