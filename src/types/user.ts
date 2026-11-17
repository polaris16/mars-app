export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

/** User shape used by the app after mapping the API response. */
export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  gender?: 'male' | 'female';
  birthday?: string;
  profileCompleted: boolean;
  interestsCompleted: boolean;
  interests?: string[];
}

export interface LoginSession {
  token: string;
  user: User;
  roles: UserRole[];
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface SendCodeRequest {
  phone: string;
}

export interface SendCodeResponse {
  message: string;
  expires_in: number;
}

export interface UpdateMyProfileRequest {
  display_name: string;
  sex: 1 | 2;
  birth_date: string;
  /** Omit until the avatar upload endpoint is available. */
  avatar_url?: string;
}

export interface InterestOption {
  id: number;
  code: string;
  name: string;
  sort_order: number;
}

export interface UpdateUserInterestsRequest {
  interest_ids: number[];
}

export interface LoginResponseUser {
  id: number;
  display_name: string | null;
  avatar_url: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  is_new_user: boolean;
  onboarding_completed: boolean;
  user: LoginResponseUser;
}
