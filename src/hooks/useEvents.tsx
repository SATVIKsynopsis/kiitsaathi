// hooks/useEvents.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/lib/database-types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("calendar_events") // Fixed typo
          .select("*")
          .eq("validation", true)
          .order("event_date", { ascending: true });
        
        if (error) {
          throw new Error(`Supabase error: ${error.message} (Check table name and permissions)`);
        }
        setEvents(data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const upcomingEvents = events
    .filter(event => new Date(event.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  return { events, upcomingEvents, loading, error };
}