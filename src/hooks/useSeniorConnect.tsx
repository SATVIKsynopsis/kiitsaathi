import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ChatSession {
  id: string;
  user1_id: string;
  user2_id: string;
  session_type: string;
  status: string;
  created_at: string;
  ended_at?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  is_flagged: boolean;
  flagged_reason?: string;
  created_at: string;
}

export interface DemoName {
  id: string;
  name: string;
  category: string;
  is_used: boolean;
}

export function useSeniorConnect() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [demoNames, setDemoNames] = useState<DemoName[]>([]);
  const [availableDemoNames, setAvailableDemoNames] = useState<DemoName[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch demo names
  const fetchDemoNames = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('demo_names')
        .select('*')
        .eq('is_used', false)
        .order('category', { ascending: true });

      if (error) throw error;

      setAvailableDemoNames(data || []);
    } catch (error: any) {
      console.error('Error fetching demo names:', error);
      toast.error('Failed to load demo names');
    }
  }, []);

  // AI content filter - flags phone numbers and suspicious content
  const checkContentSafety = (message: string): { safe: boolean; reason?: string } => {
    // Phone number patterns
    const phonePatterns = [
      /\b\d{10}\b/g, // 10 digits
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // US format
      /\+?\d{1,4}[-.\s]?\d{6,10}\b/g, // International
      /\b\d{5}[-.\s]?\d{5}\b/g, // Indian format
    ];

    // WhatsApp indicators
    const whatsappPatterns = [
      /whatsapp/gi,
      /wa\.me/gi,
      /chat\.whatsapp/gi,
    ];

    // Check for phone numbers
    for (const pattern of phonePatterns) {
      if (pattern.test(message)) {
        return { safe: false, reason: 'Phone number detected' };
      }
    }

    // Check for WhatsApp references
    for (const pattern of whatsappPatterns) {
      if (pattern.test(message)) {
        return { safe: false, reason: 'WhatsApp reference detected' };
      }
    }

    // Check for suspicious numeric strings (possible coded phone numbers)
    const suspiciousNumbers = message.match(/\b\d{8,12}\b/g);
    if (suspiciousNumbers && suspiciousNumbers.length > 0) {
      return { safe: false, reason: 'Suspicious numeric string detected' };
    }

    return { safe: true };
  };

  // Start a chat session
  const startChatSession = useCallback(async (otherUserId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to start a chat');
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId,
          session_type: 'online',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      toast.success('Chat session started! Remember to use only demo names.');
      return true;
    } catch (error: any) {
      console.error('Error starting chat session:', error);
      toast.error('Failed to start chat session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Send message with content filtering
  const sendMessage = useCallback(async (sessionId: string, message: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to send messages');
      return false;
    }

    // Check message safety
    const safetyCheck = checkContentSafety(message);
    if (!safetyCheck.safe) {
      toast.error(`⚠️ Message blocked: ${safetyCheck.reason}. Sharing personal numbers is strictly prohibited.`);
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_id: user.id,
          message: message.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local messages immediately for better UX
      setMessages(prev => [...prev, data]);
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  }, []);

  // End chat session
  const endChatSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setCurrentSession(null);
      setMessages([]);
      toast.success('Chat session ended');
      return true;
    } catch (error: any) {
      console.error('Error ending chat session:', error);
      toast.error('Failed to end chat session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentSession) return;

    const subscription = supabase
      .channel(`chat-${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${currentSession.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add if it's not already in the messages (to avoid duplicates)
          setMessages(current => {
            const exists = current.some(msg => msg.id === newMessage.id);
            if (exists) return current;
            return [...current, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSession]);

  useEffect(() => {
    fetchDemoNames();
  }, [fetchDemoNames]);

  return {
    isLoading,
    demoNames,
    availableDemoNames,
    currentSession,
    messages,
    fetchDemoNames,
    startChatSession,
    sendMessage,
    loadMessages,
    endChatSession,
    checkContentSafety
  };
}