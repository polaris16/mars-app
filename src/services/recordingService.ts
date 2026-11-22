import type {
  CreateRecordingSessionRequest,
  RecordingSession,
  RecordingSessionDetail,
  RecordingSessionsResponse,
} from '@/types/recording';
import { get, post } from '@/utils';

export function getRecordingSessionDetail(sessionId: number | string): Promise<RecordingSessionDetail> {
  return get<RecordingSessionDetail>(`/api/recording-sessions/${encodeURIComponent(String(sessionId))}`);
}

export function createRecordingSession(payload: CreateRecordingSessionRequest): Promise<RecordingSession> {
  return post<RecordingSession>('/api/recording-sessions', payload);
}

export function getRecordingSessions(
  page: number = 1,
  pageSize: number = 10
): Promise<RecordingSessionsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort: 'last_recorded_at',
    order: 'desc',
  });

  return get<RecordingSessionsResponse>(`/api/recording-sessions?${params.toString()}`);
}
