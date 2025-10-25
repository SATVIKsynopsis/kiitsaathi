import { useEffect, useState } from "react";

export interface ServiceVisibility {
  service_id: string;
  visible: boolean;
  replaced_text: string | null;
}

export function useServiceVisibility() {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, ServiceVisibility>>({});
  const [loading, setLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    async function fetchVisibility() {
      try {
        const response = await fetch('http://localhost:5001/api/service-visibility');
        const result = await response.json();

        if (!response.ok || !result.services) {
          console.error('Error fetching service visibility:', result.error || 'Unknown error');
          setHasFetchedData(true);
          setLoading(false);
          return;
        }

        const map: Record<string, ServiceVisibility> = {};
        result.services.forEach((item: ServiceVisibility) => {
          map[item.service_id] = item;
        });

        setVisibilityMap(map);
        setHasFetchedData(true);
      } catch (error) {
        console.error('Error in useServiceVisibility:', error);
        setHasFetchedData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVisibility();
  }, []);

  return { visibilityMap, loading, hasFetchedData };
}
