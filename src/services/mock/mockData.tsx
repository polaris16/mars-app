import type { LoginResponse } from '@/types/user';

/** Example response matching POST /api/auth/login, for local UI development. */
export const MOCK_LOGIN_RESPONSE: LoginResponse = {
  access_token: 'mock-access-token-10001',
  token_type: 'bearer',
  expires_at: '2026-12-17T09:06:17.131357Z',
  is_new_user: false,
  onboarding_completed: false,
  user: {
    id: 11,
    display_name: null,
    avatar_url: null,
  },
};
