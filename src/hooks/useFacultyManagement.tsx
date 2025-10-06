import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone?: string;
  linkedin?: string;
  category: 'contact' | 'faculty';
  department?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useFacultyManagement() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty_members')
        .select('*')
        .order('name');

      if (error) throw error;
      setFaculty(data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to load faculty members');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (facultyId: string, file: File) => {
    try {
      setUploading(true);

      // Validate file
      if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
        throw new Error('Only JPG and PNG files are allowed');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${facultyId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('faculty-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('faculty-photos')
        .getPublicUrl(filePath);

      // Update database record
      const { error: updateError } = await supabase
        .from('faculty_members')
        .update({ photo_url: publicUrl })
        .eq('id', facultyId);

      if (updateError) throw updateError;

      // Update local state
      setFaculty(prev => prev.map(f => 
        f.id === facultyId ? { ...f, photo_url: publicUrl } : f
      ));

      toast.success('Photo uploaded successfully!');
      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const addFaculty = async (data: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newFaculty, error } = await supabase
        .from('faculty_members')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setFaculty(prev => [...prev, newFaculty]);
      toast.success('Faculty member added successfully!');
      return newFaculty;
    } catch (error: any) {
      console.error('Add faculty error:', error);
      toast.error(error.message || 'Failed to add faculty member');
      throw error;
    }
  };

  const updateFaculty = async (id: string, updates: Partial<FacultyMember>) => {
    try {
      const { error } = await supabase
        .from('faculty_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setFaculty(prev => prev.map(f => 
        f.id === id ? { ...f, ...updates } : f
      ));

      toast.success('Faculty member updated!');
    } catch (error: any) {
      console.error('Update faculty error:', error);
      toast.error(error.message || 'Failed to update faculty member');
      throw error;
    }
  };

  return {
    faculty,
    loading,
    uploading,
    uploadPhoto,
    addFaculty,
    updateFaculty,
    refetch: fetchFaculty,
  };
}
