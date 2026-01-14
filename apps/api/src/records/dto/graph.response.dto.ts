import { GraphEdgeDto, GraphMetaDto, GraphNodeDto } from './graph.dto';

export interface GraphResponseDto {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
  meta: GraphMetaDto;
}
