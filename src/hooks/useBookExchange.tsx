import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BookExchange {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_books: any[];
  user2_books: any[];
  user1_wants: any[];
  user2_wants: any[];
  status: 'proposed' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface BookExchangeRequest {
  books_to_give: any[];
  books_wanted: any[];
  contact_info: {
    name: string;
    phone: string;
    email: string;
    location: string;
  };
}

export function useBookExchange() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availableExchanges, setAvailableExchanges] = useState<BookExchange[]>([]);
  const [myExchanges, setMyExchanges] = useState<BookExchange[]>([]);

  // Create a new exchange proposal
  const createExchangeProposal = useCallback(async (proposalData: BookExchangeRequest): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create exchange proposals');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Creating exchange proposal:', proposalData);

      // For now, we'll create a placeholder exchange (in real app, this would match with other users)
      const { data, error } = await supabase
        .from('book_exchanges')
        .insert({
          user1_id: user.id,
          user2_id: user.id, // Placeholder - would be matched later
          user1_books: proposalData.books_to_give,
          user2_books: [],
          user1_wants: proposalData.books_wanted,
          user2_wants: [],
          status: 'proposed'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('📚 Exchange proposal created! We\'ll notify you when matches are found.');
      return true;
    } catch (error: any) {
      console.error('Error creating exchange proposal:', error);
      toast.error(`Failed to create proposal: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Find potential exchange matches
  const findExchangeMatches = useCallback(async (wantedBooks: any[]): Promise<BookExchange[]> => {
    try {
      // This would implement sophisticated matching logic
      // For demo purposes, we'll return available exchanges
      const { data, error } = await supabase
        .from('book_exchanges')
        .select('*')
        .eq('status', 'proposed')
        .neq('user1_id', user?.id || '');

      if (error) throw error;

      // Filter matches based on book compatibility
      const matches = (data || []).filter((exchange: BookExchange) => {
        // Simple matching logic - in real app, this would be more sophisticated
        const hasMatchingBooks = exchange.user1_books.some((book: any) =>
          wantedBooks.some((wanted: any) => wanted.title === book.title)
        );
        return hasMatchingBooks;
      });

      return matches;
    } catch (error: any) {
      console.error('Error finding matches:', error);
      return [];
    }
  }, [user]);

  // Accept an exchange proposal
  const acceptExchangeProposal = useCallback(async (exchangeId: string, myBooks: any[]): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to accept exchanges');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('book_exchanges')
        .update({
          user2_id: user.id,
          user2_books: myBooks,
          status: 'accepted'
        })
        .eq('id', exchangeId);

      if (error) throw error;

      toast.success('🤝 Exchange proposal accepted! Contact details shared with both parties.');
      return true;
    } catch (error: any) {
      console.error('Error accepting exchange:', error);
      toast.error(`Failed to accept exchange: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark exchange as completed
  const completeExchange = useCallback(async (exchangeId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('book_exchanges')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', exchangeId);

      if (error) throw error;

      toast.success('✅ Exchange completed! Thanks for using Book Exchange.');
      return true;
    } catch (error: any) {
      console.error('Error completing exchange:', error);
      toast.error(`Failed to complete exchange: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user's exchanges
  const loadMyExchanges = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('book_exchanges')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyExchanges(data || []);
    } catch (error: any) {
      console.error('Error loading exchanges:', error);
    }
  }, [user]);

  // Load available exchanges
  const loadAvailableExchanges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('book_exchanges')
        .select('*')
        .eq('status', 'proposed')
        .neq('user1_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAvailableExchanges(data || []);
    } catch (error: any) {
      console.error('Error loading available exchanges:', error);
    }
  }, [user]);

  return {
    isLoading,
    availableExchanges,
    myExchanges,
    createExchangeProposal,
    findExchangeMatches,
    acceptExchangeProposal,
    completeExchange,
    loadMyExchanges,
    loadAvailableExchanges
  };
}