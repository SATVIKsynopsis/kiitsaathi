import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useFacultyPhotos() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const isAdmin = user?.email === 'adityash8997@gmail.com';

  const getPhotoUrl = (facultyId: string) => {
    const fileName = `${facultyId}.jpg`;
    const { data } = supabase.storage
      .from('faculty-photos')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadPhoto = async (facultyId: string, file: File) => {
    if (!isAdmin) {
      toast.error('Unauthorized access');
      return null;
    }

    // Validate file
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Only JPG and PNG files are allowed');
      return null;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return null;
    }

    setUploading(true);

    try {
      const fileName = `${facultyId}.jpg`;
      
      // Delete existing photo if any
      await supabase.storage
        .from('faculty-photos')
        .remove([fileName]);

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('faculty-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const photoUrl = getPhotoUrl(facultyId);
      toast.success('Profile photo updated successfully');
      return photoUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    isAdmin,
    uploading,
    getPhotoUrl,
    uploadPhoto,
  };
}
