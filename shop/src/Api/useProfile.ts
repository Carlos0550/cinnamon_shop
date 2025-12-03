import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppContext } from '@/providers/AppContext';

type Profile = {
  id: number;
  email: string;
  name: string;
  profile_image?: string;
  phone?: string;
  shipping_street?: string;
  shipping_postal_code?: string;
  shipping_city?: string;
  shipping_province?: string;
};

type UpdatePayload = Partial<{
  name: string;
  phone: string;
  shipping_street: string;
  shipping_postal_code: string;
  shipping_city: string;
  shipping_province: string;
}>;

export function useGetProfile() {
  const { utils: { baseUrl }, auth: { state } } = useAppContext();
  return useQuery<{ ok: boolean; user: Profile | null }, Error>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/profile/me`, { headers: { Authorization: `Bearer ${state.token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'profile_fetch_failed');
      return json;
    },
    enabled: !!state.token,
  });
}

export function useUpdateProfile() {
  const { utils: { baseUrl }, auth: { state } } = useAppContext();
  return useMutation<{ ok: boolean; user: Profile }, Error, UpdatePayload>({
    mutationKey: ['profile_update'],
    mutationFn: async (payload) => {
      const res = await fetch(`${baseUrl}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'profile_update_failed');
      return json;
    },
  });
}

export function useUploadAvatar() {
  const { utils: { baseUrl }, auth: { state } } = useAppContext();
  return useMutation<{ ok: boolean; user: Pick<Profile, 'id'|'email'|'name'|'profile_image'>; url: string }, Error, File>({
    mutationKey: ['profile_avatar'],
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${baseUrl}/profile/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${state.token}` }, body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'avatar_upload_failed');
      return json;
    },
  });
}

