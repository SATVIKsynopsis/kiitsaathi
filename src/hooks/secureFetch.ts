import { useAuth } from "@/hooks/useAuth";

export async function secureFetch(url: string, options: RequestInit = {}) {
  const { accessToken } = useAuth();
  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

  const headers = {
    ...(options.headers || {}),
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
    'Content-Type': 'application/json'
  };

  return fetch(`${HOSTED_URL}${url}`, { ...options, headers });
}
