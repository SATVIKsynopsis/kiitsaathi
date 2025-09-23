import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceVisibility {
  service_id: string;
  visible: boolean;
  replaced_text: string | null;
}

export function useServiceVisibility() {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, ServiceVisibility>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisibility() {
      try {
        const { data, error } = await supabase
          .from('service_visibility')
          .select('*');

        if (error) {
          console.error('Error fetching service visibility:', error);
          return;
        }

        // Convert to map for easy lookup
        const map: Record<string, ServiceVisibility> = {};
        data?.forEach(item => {
          map[item.service_id] = item;
        });

        setVisibilityMap(map);
      } catch (error) {
        console.error('Error in useServiceVisibility:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVisibility();
  }, []);

  return { visibilityMap, loading };
}