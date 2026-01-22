import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../constants';

export interface CreateTagRequest {
  name: string;
}

export interface TagResponse {
  publicId: string;
  name: string;
  isSystem: boolean;
}

export interface CreateTagResponse {
  status: 'success';
  data: {
    tag: TagResponse;
  };
}

export interface TagsResponse {
  status: 'success';
  data: {
    tags: TagResponse[];
  };
}

/**
 * 태그 전체 조회 API 호출
 */
export async function getTags(): Promise<TagResponse[]> {
  const response = await apiClient<TagsResponse>(API_ENDPOINTS.TAGS, {
    method: 'GET',
  });

  return response.data.tags;
}

/**
 * 태그 생성 API 호출
 */
export async function createTag(
  request: CreateTagRequest,
): Promise<TagResponse> {
  const response = await apiClient<CreateTagResponse>(API_ENDPOINTS.TAGS, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response.data.tag;
}

/**
 * 태그 삭제 API 호출
 */
export async function deleteTag(publicId: string): Promise<void> {
  await apiClient<void>(API_ENDPOINTS.TAGS_BY_ID(publicId), {
    method: 'DELETE',
  });
}
