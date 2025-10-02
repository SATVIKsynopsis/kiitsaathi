import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAuth() {
  const { user, session, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;
      
      if (!user || !session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Call admin check edge function
        const { data, error } = await supabase.functions.invoke('admin-check', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error('Admin check error:', error);
          setError('Failed to verify admin status');
          setIsAdmin(false);
        } else if (data?.success) {
          setIsAdmin(true);
          setError(null);
        } else {
          setIsAdmin(false);
          setError(data?.error || 'Access denied');
        }
      } catch (err) {
        console.error('Admin auth error:', err);
        setError('Authentication failed');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, session, authLoading]);

  return {
    isAdmin,
    loading: loading || authLoading,
    error,
    user
  };
}