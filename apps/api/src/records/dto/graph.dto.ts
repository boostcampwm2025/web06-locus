export interface GraphNodeDto {
  publicId: string;
  location: LocationDto;
}

export interface GraphEdgeDto {
  fromRecordPublicId: string;
  toRecordPublicId: string;
}

export interface GraphMetaDto {
  start: string;
  nodeCount: number;
  edgeCount: number;
  truncated: boolean;
}

export interface LocationDto {
  latitude: number;
  longitude: number;
}
