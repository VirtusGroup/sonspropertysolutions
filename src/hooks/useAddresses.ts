import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  unit: string | null;
  city: string;
  state: string;
  zip: string;
  property_type: 'residential' | 'commercial';
  is_default: boolean;
  created_at: string;
}

export function useAddresses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Address[];
    },
    enabled: !!user,
  });

  const addAddress = useMutation({
    mutationFn: async (address: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
    },
  });

  const updateAddress = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Address> & { id: string }) => {
      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
    },
  });

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
