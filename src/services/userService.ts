import type { InterestOption, UpdateMyProfileRequest, UpdateUserInterestsRequest } from '@/types/user';
import { get, patch, put } from '@/utils';

export function updateMyProfile(payload: UpdateMyProfileRequest): Promise<unknown> {
  return patch<unknown>('/api/users/me/profile', payload);
}

export function getInterests(): Promise<InterestOption[]> {
  return get<InterestOption[]>('/api/interests');
}

export function updateMyInterests(payload: UpdateUserInterestsRequest): Promise<unknown> {
  return put<unknown>('/api/users/me/interests', payload);
}
