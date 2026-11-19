import type { RecordingSessionsResponse } from '@/types/recording';
import { get } from '@/utils';

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
