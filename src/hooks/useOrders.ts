import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export interface OrderPhoto {
  id: string;
  order_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  job_ref: string;
  user_id: string;
  service_id: string;
  address_id: string | null;
  address_snapshot: Json | null;
  property_type: 'residential' | 'commercial';
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  preferred_window: string | null;
  notes: string | null;
  estimate_low: number | null;
  estimate_high: number | null;
  status: 'received' | 'scheduled' | 'in_progress' | 'job_complete' | 'finished' | 'cancelled';
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  order_photos?: OrderPhoto[];
}

export interface CreateOrderInput {
  service_id: string;
  address_id?: string | null;
  address_snapshot?: Json;
  property_type: 'residential' | 'commercial';
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  preferred_window?: string;
  notes?: string;
  estimate_low?: number;
  estimate_high?: number;
  scheduled_at?: string;
}

export function useOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_photos (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  const createOrder = useMutation({
    mutationFn: async (order: CreateOrderInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          service_id: order.service_id,
          address_id: order.address_id,
          address_snapshot: order.address_snapshot,
          property_type: order.property_type,
          contact_first_name: order.contact_first_name,
          contact_last_name: order.contact_last_name,
          contact_email: order.contact_email,
          contact_phone: order.contact_phone,
          preferred_window: order.preferred_window,
          notes: order.notes,
          estimate_low: order.estimate_low,
          estimate_high: order.estimate_high,
          scheduled_at: order.scheduled_at,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<Order, 'id' | 'order_photos'>>) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createOrder,
    updateOrder,
  };
}

export function useOrder(orderId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId || !user) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_photos (*)
        `)
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!orderId && !!user,
  });
}
