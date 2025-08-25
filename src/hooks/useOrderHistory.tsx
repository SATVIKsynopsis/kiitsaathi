import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

export type Order = Database['public']['Tables']['orders']['Row'];

export type OrderInsert = Database['public']['Tables']['orders']['Insert'];

export function useOrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const createOrder = async (orderData: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('User must be authenticated to create orders');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setOrders(prev => [data, ...prev]);
      
      toast({
        title: 'Order Recorded',
        description: 'Your transaction has been saved to order history'
      });

      return data;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to record order',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', orderId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: status }
            : order
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

  const getStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Order['payment_status']) => {
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