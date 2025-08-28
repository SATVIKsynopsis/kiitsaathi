import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { apiFetch } from '@/lib/api';

export function useAuthenticatedFetch() {
  const { session, user } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return apiFetch(url, options, session.access_token);
  };

  const invokeEdgeFunction = async (functionName: string, body: any) => {
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Edge function error', { functionName, error });
      throw error;
    }
    return data;
  };

  return {
    authenticatedFetch,
    invokeEdgeFunction,
    isAuthenticated: !!user,
    user,
  };
}