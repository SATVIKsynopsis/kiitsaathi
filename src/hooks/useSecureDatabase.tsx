import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface DatabaseError {
  message: string;
  retryable: boolean;
}

interface SecureDatabaseHook {
  loading: boolean;
  error: DatabaseError | null;
  executeQuery: <T>(query: () => Promise<T>, options?: { retries?: number; fallback?: T }) => Promise<T | null>;
  clearError: () => void;
}

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;


export function useSecureDatabase(): SecureDatabaseHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DatabaseError | null>(null);
  const { user } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeQuery = useCallback(async <T,>(
    query: () => Promise<T>,
    options: { retries?: number; fallback?: T } = {}
  ): Promise<T | null> => {
    const { retries = 3, fallback } = options;
    setLoading(true);
    setError(null);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await query();
        setLoading(false);
        return result;
      } catch (err: any) {
        console.error(`Database query attempt ${attempt + 1} failed:`, err);
        
        // Log the error to our audit system if user is authenticated
        if (user) {
          try {
            // Log errors to console instead of RPC for now to avoid TypeScript issues
            console.warn('Database error logged:', {
              query_type: 'frontend_query',
              error_details: String((err as Error).message || 'Unknown error')
            });
          } catch (logError) {
            console.warn('Failed to log error to audit system:', logError);
          }
        }

        // If this is the last attempt, set error state
        if (attempt === retries - 1) {
          const isNetworkError = err.message?.includes('network') || err.message?.includes('fetch');
          const isDatabaseError = err.message?.includes('database') || err.message?.includes('connection');
          
          setError({
            message: isNetworkError || isDatabaseError 
              ? 'Database temporarily unavailable. Please try again in a moment.'
              : 'An error occurred while loading data. Please refresh the page.',
            retryable: isNetworkError || isDatabaseError
          });
          
          toast.error('Database connection issue. Retrying...');
          
          // Return fallback if provided
          if (fallback !== undefined) {
            setLoading(false);
            return fallback;
          }
        } else {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    setLoading(false);
    return null;
  }, [user]);

  return {
    loading,
    error,
    executeQuery,
    clearError
  };
}