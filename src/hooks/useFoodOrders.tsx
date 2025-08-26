import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface OrderItem {
  itemName: string;
  quantity: number;
  mrp: number;
}

export interface FoodOrder {
  id?: number;
  customer_name: string;
  phone_number: string;
  delivery_location: string;
  special_notes?: string;
  items: OrderItem[];
  total_mrp: number;
  delivery_charge_percent: number;
  total_payable: number;
  status: 'pending' | 'accepted' | 'delivered';
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
  helper_id?: string;
}

type FoodOrderRow = Database['public']['Tables']['food_orders']['Row'];

export function useFoodOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const convertRowToFoodOrder = (row: FoodOrderRow): FoodOrder => ({
    ...row,
    items: Array.isArray(row.items) ? (row.items as unknown as OrderItem[]) : [],
    status: row.status as 'pending' | 'accepted' | 'delivered',
    customer_id: row.customer_id || undefined,
    helper_id: row.helper_id || undefined,
  });

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(convertRowToFoodOrder));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<FoodOrder, 'id' | 'status' | 'created_at' | 'updated_at' | 'customer_id' | 'helper_id'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an order",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .insert({
          ...orderData,
          customer_id: user.id,
          status: 'pending',
          items: orderData.items as any
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order Created",
        description: "Your order has been submitted successfully!",
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: number) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Check if order is still pending before accepting
      const { data: currentOrder, error: fetchError } = await supabase
        .from('food_orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      if (currentOrder.status !== 'pending') {
        toast({
          title: "Order Not Available",
          description: "This order has already been accepted by another helper",
          variant: "destructive",
        });
        await fetchOrders();
        return false;
      }

      const { error } = await supabase
        .from('food_orders')
        .update({
          status: 'accepted',
          helper_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Order Accepted",
        description: "You have successfully accepted this order!",
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deliverOrder = async (orderId: number) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('food_orders')
        .update({
          status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('helper_id', user.id);

      if (error) throw error;

      toast({
        title: "Order Delivered",
        description: "Order has been marked as delivered!",
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error delivering order:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as delivered. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('food-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_orders'
        },
        () => {
          fetchOrders(); // Refresh orders when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    orders,
    loading,
    createOrder,
    acceptOrder,
    deliverOrder,
    fetchOrders
  };
}