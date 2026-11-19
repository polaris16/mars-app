export interface RecordingSession {
  id: number;
  topic_id: number;
  topic_title: string;
  title: string;
  is_favorite: boolean;
  last_recorded_at: string | null;
  created_at: string;
  fragment_count: number;
  attachment_count: number;
  duration_ms: number;
  transcript_excerpt: string | null;
}

export interface RecordingSessionsResponse {
  page: number;
  page_size: number;
  total: number;
  items: RecordingSession[];
}
