import type { RecommendedTopicsResponse } from '@/types/topic';
import { get } from '@/utils';

export function getRecommendedTopics(
  page: number = 1,
  pageSize: number = 10
): Promise<RecommendedTopicsResponse> {
  return get<RecommendedTopicsResponse>(
    `/api/topics/recommended?page=${page}&page_size=${pageSize}`
  );
}
