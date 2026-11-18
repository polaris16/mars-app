import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl as string;
const AUTH_TOKEN_KEY = 'access_token';

type RequestOptions = {
  headers?: Record<string, string>;
};

async function request<T>(path: string, method: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  const headers: Record<string, string> = {
    Accept: '*/*',
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (options.headers?.Authorization) {
    headers.Authorization = options.headers.Authorization;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    delete headers.Authorization;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const responseText = await response.text();
  let data: unknown;
  try {
    data = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    const errorData = data as { detail?: unknown; message?: unknown } | undefined;
    const message = typeof errorData?.detail === 'string'
      ? errorData.detail
      : typeof errorData?.message === 'string'
        ? errorData.message
        : `请求失败 (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export const get = <T>(path: string, options?: RequestOptions) => request<T>(path, 'GET', undefined, options);
export const post = <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'POST', body, options);
export const patch = <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'PATCH', body, options);
export const put = <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'PUT', body, options);
const deleteRequest = <T>(path: string, options?: RequestOptions) => request<T>(path, 'DELETE', undefined, options);
export { deleteRequest as delete };
