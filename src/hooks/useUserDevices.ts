import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserDevice {
  id: string;
  user_id: string;
  fcm_token: string;
  platform: 'ios' | 'android' | 'web';
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export function useUserDevices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's active devices
  const query = useQuery({
    queryKey: ['user-devices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserDevice[];
    },
    enabled: !!user,
  });

  // Register a new device
  const registerDevice = useMutation({
    mutationFn: async ({ 
      fcmToken, 
      platform, 
      deviceName 
    }: { 
      fcmToken: string; 
      platform: 'ios' | 'android' | 'web'; 
      deviceName?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Upsert: if token exists, update; otherwise insert
      const { data, error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: user.id,
          fcm_token: fcmToken,
          platform,
          device_name: deviceName,
          is_active: true,
        }, {
          onConflict: 'fcm_token',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserDevice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices', user?.id] });
    },
  });

  // Unregister a device (soft delete)
  const unregisterDevice = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_active: false })
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices', user?.id] });
    },
  });

  return {
    devices: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    registerDevice,
    unregisterDevice,
  };
}
