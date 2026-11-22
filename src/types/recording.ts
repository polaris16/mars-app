export interface RecordingSession {
  id: number;
  topic_id: number;
  topic_title: string | null;
  title: string;
  is_favorite: boolean;
  last_recorded_at: string | null;
  created_at: string;
  fragment_count: number;
  attachment_count: number;
  duration_ms: number;
  transcript_excerpt: string | null;
}

export interface RecordingAsset {
  id: number;
  purpose: string;
  media_type: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  duration_ms: number | null;
  sample_rate_hz: number | null;
  upload_status: string;
  created_at: string;
  download_url: string | null;
  url_expires_at: string | null;
}

export interface RecordingAttachment {
  id: number;
  asset?: RecordingAsset | null;
  [key: string]: unknown;
}

export interface RecordingFragment {
  id: number;
  session_id: number;
  sequence_no: number;
  contributor_id: number;
  source_type: string;
  source_asset: RecordingAsset | null;
  content_text: string | null;
  transcript_raw: string | null;
  transcript_edited: string | null;
  recorded_at: string | null;
  attachments: RecordingAttachment[];
}

export interface RecordingSessionDetail extends RecordingSession {
  visibility: string | null;
  fragments: RecordingFragment[];
}

export interface CreateRecordingSessionRequest {
  topic_id: number;
  title: string;
  visibility: string;
}

export interface RecordingSessionsResponse {
  page: number;
  page_size: number;
  total: number;
  items: RecordingSession[];
}
