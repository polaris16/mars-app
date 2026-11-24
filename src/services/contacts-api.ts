import { get, post } from '@/utils';

type Page<T> = { items: T[]; page: number; page_size: number; total: number };
type ApiUser = { id: number; display_name: string | null; avatar_url: string | null };
export type ContactRequest = {
  request_id: number;
  contact_user: ApiUser;
  message: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
};
export type ApiContact = {
  id: number;
  relationship_label: string | null;
  contact_user: ApiUser;
};
export type ContactSearchResult = ApiUser;

export async function fetchContacts() {
  const response = await get<Page<ApiContact> | ApiContact[]>(
    '/api/users/me/contacts?view=active&page=1&page_size=10&paginate=false&sort=default'
  );
  return Array.isArray(response) ? response : response.items;
}

export async function fetchIncomingRequests() {
  const response = await get<Page<ContactRequest>>(
    '/api/users/me/contacts/requests?direction=incoming&page=1&page_size=10&paginate=true&sort=default'
  );
  return response.items;
}

export async function searchContacts(keyword: string) {
  const response = await post<Page<ContactSearchResult>>('/api/users/me/contacts/search', {
    keyword,
    page: 1,
    page_size: 20,
    paginate: true,
    sort: 'default',
  });
  return response.items;
}

export function sendContactRequest(relatedUserId: number, message: string) {
  return post('/api/users/me/contacts/requests', { related_user_id: relatedUserId, message });
}

export function resolveContactRequest(requestId: number, action: 'accept' | 'reject') {
  return post(`/api/users/me/relationships/${requestId}/${action}`);
}
