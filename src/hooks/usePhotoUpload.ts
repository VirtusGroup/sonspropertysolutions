import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePhotoUpload() {
  const { user } = useAuth();

  const uploadPhoto = async (file: File): Promise<{ path: string; url: string } | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('order-photos')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('order-photos')
      .getPublicUrl(filePath);
    
    return { path: filePath, url: publicUrl };
  };

  const getPhotoUrl = (storagePath: string): string => {
    const { data: { publicUrl } } = supabase.storage
      .from('order-photos')
      .getPublicUrl(storagePath);
    
    return publicUrl;
  };

  const deletePhoto = async (storagePath: string): Promise<boolean> => {
    const { error } = await supabase.storage
      .from('order-photos')
      .remove([storagePath]);
    
    return !error;
  };

  const savePhotoRecord = async (
    orderId: string, 
    storagePath: string, 
    file: File,
    caption?: string
  ) => {
    const { data, error } = await supabase
      .from('order_photos')
      .insert({
        order_id: orderId,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        caption,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  return {
    uploadPhoto,
    getPhotoUrl,
    deletePhoto,
    savePhotoRecord,
  };
}
