import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export function useOrderHistory() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

  const fetchOrders = async () => {
    if (!user || !accessToken) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${HOSTED_URL}/api/orders?user_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });
      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to fetch orders');
      }

      setOrders(result.orders || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch order history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    if (!user || !accessToken) {
      throw new Error('User must be authenticated to create orders');
    }

    try {
      const response = await fetch(`${HOSTED_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id, ...orderData })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to create order');
      }

      setOrders(prev => [result.order, ...prev]);

      toast({
        title: 'Order Recorded',
        description: 'Your transaction has been saved to order history'
      });

      return result.order;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to record order',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${HOSTED_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id, status })
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to update status');
      }

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, payment_status: status } : order
        )
      );

    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'failed': return '💥';
      default: return '❓';
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    getStatusColor,
    getStatusIcon
  };
}
