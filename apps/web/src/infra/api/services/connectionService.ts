import { apiClient } from '../index';
import { API_ENDPOINTS } from '../constants';
import type {
  CreateConnectionRequest,
  CreateConnectionResponse,
  DeleteConnectionResponse,
  GraphEdgeResponse,
  GraphResponse,
  ConnectedRecordsResponse,
} from '@/infra/types/connection';

export type {
  CreateConnectionRequest,
  CreateConnectionResponse,
  DeleteConnectionResponse,
  GraphEdgeResponse,
  GraphResponse,
  ConnectedRecordsResponse,
};

/**
 * 연결 생성
 * POST /connections
 */
export async function createConnection(
  request: CreateConnectionRequest,
): Promise<CreateConnectionResponse> {
  const response = await apiClient<CreateConnectionResponse>(
    API_ENDPOINTS.CONNECTIONS,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response;
}

/**
 * 연결 삭제
 * DELETE /connections/{publicId}
 */
export async function deleteConnection(
  publicId: string,
): Promise<DeleteConnectionResponse> {
  const response = await apiClient<DeleteConnectionResponse>(
    API_ENDPOINTS.CONNECTIONS_BY_ID(publicId),
    {
      method: 'DELETE',
    },
  );

  return response;
}

/**
 * 기록 그래프 조회
 * GET /records/{publicId}/graph
 */
export async function getRecordGraph(
  publicId: string,
  options?: {
    maxNodes?: number;
    maxEdges?: number;
    maxDepth?: number;
  },
): Promise<GraphResponse> {
  const params = new URLSearchParams();
  if (options?.maxNodes) {
    params.append('maxNodes', String(options.maxNodes));
  }
  if (options?.maxEdges) {
    params.append('maxEdges', String(options.maxEdges));
  }
  if (options?.maxDepth) {
    params.append('maxDepth', String(options.maxDepth));
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.RECORDS_GRAPH(publicId)}?${queryString}`
    : API_ENDPOINTS.RECORDS_GRAPH(publicId);

  const response = await apiClient<GraphResponse>(endpoint, {
    method: 'GET',
  });

  return response;
}

/**
 * 연결된 기록 목록 조회
 * GET /records/{publicId}/graph/records
 */
export async function getConnectedRecords(
  publicId: string,
  options?: {
    cursor?: string;
    limit?: number;
  },
): Promise<ConnectedRecordsResponse> {
  const params = new URLSearchParams();
  if (options?.cursor) {
    params.append('cursor', options.cursor);
  }
  if (options?.limit) {
    params.append('limit', String(options.limit));
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.RECORDS_GRAPH_RECORDS(publicId)}?${queryString}`
    : API_ENDPOINTS.RECORDS_GRAPH_RECORDS(publicId);

  const response = await apiClient<ConnectedRecordsResponse>(endpoint, {
    method: 'GET',
  });

  return response;
}
