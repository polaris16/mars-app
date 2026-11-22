import type {
  CompleteRecordingAssetRequest,
  CreateRecordingSessionRequest,
  CreateRecordingFragmentRequest,
  RecordingSession,
  RecordingSessionDetail,
  RecordingSessionsResponse,
  RecordingUploadAuthorizationRequest,
  RecordingUploadAuthorizationResponse,
  RecordingFragment,
} from '@/types/recording';
import Constants from 'expo-constants';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { get, post } from '@/utils';

interface LocalRecordingFile {
  filename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  upload: (authorization: RecordingUploadAuthorizationResponse) => Promise<void>;
}

function filenameFromUri(uri: string, fallbackExtension: string): string {
  const lastSegment = uri.split(/[/?#]/).filter(Boolean).at(-1);
  if (!lastSegment || lastSegment.startsWith('blob:')) return `recording-${Date.now()}.${fallbackExtension}`;
  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
}

function formatSha256(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

function resolveUploadUrl(uploadUrl: string): string {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof apiBaseUrl !== 'string' || !apiBaseUrl) return uploadUrl;
  try {
    const signedUrl = new URL(uploadUrl);
    const apiUrl = new URL(apiBaseUrl);
    if (signedUrl.hostname === '127.0.0.1' || signedUrl.hostname === 'localhost' || signedUrl.hostname === '0.0.0.0') {
      signedUrl.protocol = apiUrl.protocol;
      signedUrl.host = apiUrl.host;
      return signedUrl.toString();
    }
  } catch {
    return uploadUrl;
  }
  return uploadUrl;
}

async function inspectRecordingFile(uri: string): Promise<LocalRecordingFile> {
  if (Platform.OS === 'web') {
    const fileResponse = await fetch(uri);
    if (!fileResponse.ok) throw new Error(`读取本地录音失败 (${fileResponse.status})`);
    const blob = await fileResponse.blob();
    if (blob.size <= 0) throw new Error('录音文件为空。');
    if (!globalThis.crypto?.subtle) throw new Error('当前浏览器环境不支持计算录音文件校验值。');
    const sha256 = formatSha256(await globalThis.crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
    const contentType = (blob.type || 'audio/webm').split(';', 1)[0];
    const extension = contentType.includes('webm') ? 'webm' : 'm4a';
    const uriFilename = filenameFromUri(uri, extension);
    const filename = /\.[a-z0-9]{2,5}$/i.test(uriFilename)
      ? uriFilename
      : `recording-${Date.now()}.${extension}`;

    return {
      filename,
      contentType,
      sizeBytes: blob.size,
      sha256,
      upload: async authorization => {
        if (!authorization.upload_url) throw new Error('服务器没有返回录音上传地址。');
        const response = await fetch(resolveUploadUrl(authorization.upload_url), {
          method: authorization.upload_method,
          headers: authorization.required_headers,
          body: blob,
        });
        if (!response.ok) throw new Error(`上传录音失败 (${response.status})`);
      },
    };
  }

  const file = new File(uri);
  if (!file.exists) throw new Error('找不到本地录音文件。');
  if (file.size <= 0) throw new Error('录音文件为空。');
  const contentType = 'audio/m4a';

  return {
    filename: file.name || filenameFromUri(uri, 'm4a'),
    contentType,
    sizeBytes: file.size,
    sha256: await file.digest('SHA-256'),
    upload: async authorization => {
      if (!authorization.upload_url) throw new Error('服务器没有返回录音上传地址。');
      const response = await file.upload(resolveUploadUrl(authorization.upload_url), {
        httpMethod: authorization.upload_method,
        mimeType: contentType,
        headers: authorization.required_headers,
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`上传录音失败 (${response.status})`);
      }
    },
  };
}

export async function uploadRecordingToSession(input: {
  sessionId: number;
  fileUri: string;
  durationMs: number;
  sampleRateHz: number;
  recordedAt?: string;
}): Promise<RecordingFragment> {
  const localFile = await inspectRecordingFile(input.fileUri);
  const authorizationRequest: RecordingUploadAuthorizationRequest = {
    purpose: 'recording',
    media_type: 'audio',
    filename: localFile.filename,
    content_type: localFile.contentType,
    size_bytes: localFile.sizeBytes,
    sha256: localFile.sha256,
    session_id: input.sessionId,
  };
  const authorization = await post<RecordingUploadAuthorizationResponse>(
    '/api/media-assets/upload-authorizations',
    authorizationRequest
  );

  if (!authorization.reused) await localFile.upload(authorization);

  const completeRequest: CompleteRecordingAssetRequest = {
    duration_ms: Math.max(0, Math.round(input.durationMs)),
    sample_rate_hz: input.sampleRateHz,
  };
  await post(`/api/media-assets/${authorization.asset_id}/complete`, completeRequest);

  const fragmentRequest: CreateRecordingFragmentRequest = {
    source_type: 'audio',
    source_asset_id: authorization.asset_id,
    recorded_at: input.recordedAt ?? new Date().toISOString(),
  };
  return post<RecordingFragment>(
    `/api/recording-sessions/${input.sessionId}/fragments`,
    fragmentRequest
  );
}

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
