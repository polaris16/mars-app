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
  session_id?: number;
  asset?: RecordingAsset | null;
  [key: string]: unknown;
}

export interface AttachmentUploadAuthorizationItem {
  client_file_id: string;
  filename: string;
  media_type: 'image' | 'video' | 'audio';
  content_type: string;
  size_bytes: number;
}

export interface AttachmentUploadAuthorization {
  client_file_id: string;
  status: string;
  asset_id: number;
  upload_url: string | null;
  upload_method: 'PUT';
  required_headers: Record<string, string>;
  expires_at: string | null;
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

export interface RecordingUploadAuthorizationRequest {
  purpose: 'recording';
  media_type: 'audio';
  filename: string;
  content_type: string;
  size_bytes: number;
  sha256: string;
  session_id: number;
}

export interface RecordingUploadAuthorizationResponse {
  reused: boolean;
  asset_id: number;
  upload_method: 'PUT';
  upload_url: string | null;
  required_headers: Record<string, string>;
  expires_at: string | null;
}

export interface CompleteRecordingAssetRequest {
  duration_ms: number;
  sample_rate_hz: number;
}

export interface CreateRecordingFragmentRequest {
  source_type: 'audio';
  source_asset_id: number;
  recorded_at: string;
}

export interface RecordingSessionsResponse {
  page: number;
  page_size: number;
  total: number;
  items: RecordingSession[];
}
