export interface TopicItem {
  id: number;
  title: string;
  icon_key: string;
  summary: string;
  prompt: string;
  category: string;
  life_stage: string | null;
  participant_count: number;
  recommendation_source: string;
}

export interface RecommendedTopicsResponse {
  items: TopicItem[];
  page: number;
  page_size: number;
  total: number;
}
