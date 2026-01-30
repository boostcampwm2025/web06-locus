import type {
  GraphNode,
  GraphMeta,
  ConnectedRecordDetail,
  GraphDetailsResponse,
} from '@locus/shared';

export type { GraphDetailsResponse };

/**
 * 연결 생성 요청
 */
export interface CreateConnectionRequest {
  fromRecordPublicId: string;
  toRecordPublicId: string;
}

/**
 * 연결 생성 응답
 */
export interface CreateConnectionResponse {
  status: 'success';
  data: {
    connection: {
      publicId: string;
      fromRecordPublicId: string;
      toRecordPublicId: string;
      createdAt: string;
    };
  };
}

/**
 * 연결 삭제 응답
 */
export interface DeleteConnectionResponse {
  status: 'success';
  data: {
    deleted: {
      publicId: string;
      pairPublicId?: string;
    };
  };
}

/**
 * 그래프 엣지 (API 응답 형식에 맞춤)
 */
export interface GraphEdgeResponse {
  fromRecordPublicId: string;
  toRecordPublicId: string;
}

/**
 * 그래프 조회 응답
 */
export interface GraphResponse {
  status: 'success';
  message?: string;
  data: {
    nodes: GraphNode[];
    edges: GraphEdgeResponse[];
    meta: GraphMeta;
  };
}

/**
 * 연결된 기록 조회 응답
 */
export interface ConnectedRecordsResponse {
  status: 'success';
  data: {
    start: string;
    records: ConnectedRecordDetail[];
    page: {
      limit: number;
      nextCursor: string | null;
      hasNext: boolean;
    };
  };
}

/**
 * localStorage에 저장된 연결 정보
 */
export interface StoredConnection {
  publicId: string;
  fromRecordPublicId: string;
  toRecordPublicId: string;
  createdAt: string;
}

/**
 * 저장소 기반 그래프 노드
 */
export interface StoredGraphNode {
  publicId: string;
  location: { latitude: number; longitude: number };
}

/**
 * 저장소 기반 그래프 엣지
 */
export interface StoredGraphEdge {
  fromRecordPublicId: string;
  toRecordPublicId: string;
}

/**
 * 저장소 기반 그래프 데이터
 */
export interface StoredGraph {
  nodes: StoredGraphNode[];
  edges: StoredGraphEdge[];
}
