import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSecureDatabase } from './useSecureDatabase';

interface LostAndFoundItem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  item_type: 'lost' | 'found';
  image_url?: string;
  status: string;
  date: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
}

export function useSecureLostAndFound() {
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const { user } = useAuth();
  const { loading, error, executeQuery, clearError } = useSecureDatabase();

  // ✅ Fetch active items from backend
  const fetchItems = async () => {
    const result = await executeQuery(async () => {
      const response = await fetch('/api/lostfound');
      const data = await response.json();
      return data.items as LostAndFoundItem[];
    }, { 
      fallback: [] as LostAndFoundItem[],
      retries: 3 
    });

    if (result) {
      setItems(result);
    }
  };

  // ✅ Add a new item (requires user)
  const addItem = async (itemData: Omit<LostAndFoundItem, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>) => {
    if (!user) {
      throw new Error('Authentication required to add items');
    }

    const result = await executeQuery(async () => {
      const response = await fetch('/api/lostfound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...itemData
        })
      });
      const data = await response.json();
      return data.item as LostAndFoundItem;
    });

    if (result) {
      await fetchItems(); // Refresh after adding
      return result;
    }
    return null;
  };

  // ✅ Update an item
  const updateItem = async (id: string, updates: Partial<LostAndFoundItem>) => {
    if (!user) {
      throw new Error('Authentication required to update items');
    }

    const result = await executeQuery(async () => {
      const response = await fetch(`/api/lostfound/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...updates
        })
      });
      const data = await response.json();
      return data.item as LostAndFoundItem;
    });

    if (result) {
      await fetchItems(); // Refresh after update
      return result;
    }
    return null;
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    refreshItems: fetchItems,
    clearError
  };
}
