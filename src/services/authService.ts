import type { LoginRequest, LoginResponse, SendCodeRequest, SendCodeResponse } from '@/types/user';
import { post } from '@/utils';

export function loginWithPhoneCode(payload: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', payload);
}

export function sendPhoneCode(payload: SendCodeRequest): Promise<SendCodeResponse> {
  return post<SendCodeResponse>('/api/auth/send-code', payload);
}
