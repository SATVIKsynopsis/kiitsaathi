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

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;


export function useSecureLostAndFound() {
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const { user, accessToken } = useAuth();
  const { loading, error, executeQuery, clearError } = useSecureDatabase();

  // ✅ Fetch active items from backend
  const fetchItems = async () => {
    const result = await executeQuery(async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add token only if user is logged in (GET is public, but include token for future features)
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${HOSTED_URL}/api/lostfound/items`, {
        credentials: 'include',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Fetched Lost & Found items:', data.items?.length || 0);
      console.log('🖼️ Sample image URLs:', data.items?.slice(0, 3).map((item: any) => ({ 
        title: item.title, 
        image_url: item.image_url 
      })));
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
    if (!user || !accessToken) {
      throw new Error('Authentication required to add items');
    }

    const result = await executeQuery(async () => {
      const response = await fetch(`${HOSTED_URL}/api/lostfound/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: user.id,
          ...itemData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
    if (!user || !accessToken) {
      throw new Error('Authentication required to update items');
    }

    const result = await executeQuery(async () => {
      const response = await fetch(`${HOSTED_URL}/api/lostfound/items/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: user.id,
          ...updates
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
