import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AssignmentRequest {
  id: string;
  student_name: string;
  whatsapp_number: string;
  year: string;
  branch: string;
  pages: number;
  deadline: string;
  hostel_name: string;
  room_number: string;
  special_instructions?: string;
  is_urgent: boolean;
  match_handwriting: boolean;
  delivery_method: string;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  files?: AssignmentFile[];
}

export interface AssignmentFile {
  id: string;
  assignment_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface AssignmentHelper {
  id: string;
  name: string;
  email?: string;
  contact: string;
  year: string;
  course: string;
  rating: number;
  total_assignments: number;
  specializations: string[];
  sample_description?: string;
}

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

export function useAssignmentManager() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRequest[]>([]);
  const [helpers, setHelpers] = useState<AssignmentHelper[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's assignments
  const fetchAssignments = async () => {
  if (!user) return;

  setLoading(true);
  try {
    const response = await fetch(`${HOSTED_URL}/api/assignments?user_id=${user.id}`);
    const result = await response.json();
    setAssignments(result.assignments || []);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    toast.error('Failed to load assignments');
  } finally {
    setLoading(false);
  }
};


  // Fetch available helpers
  const fetchHelpers = async () => {
  try {
    const response = await fetch(`${HOSTED_URL}/api/helpers`);
    const result = await response.json();
    setHelpers(result.helpers || []);
  } catch (error) {
    console.error('Error fetching helpers:', error);
  }
};

  // Upload files to storage
  const uploadFiles = async (files: File[], assignmentId: string): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('assignment_files')
        .insert({
          assignment_id: assignmentId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to save ${file.name} record`);
      }

      uploadedPaths.push(filePath);
    }

    return uploadedPaths;
  };

  // Create assignment request
  const createAssignment = async (formData: any, files: File[]) => {
  if (!user) {
    toast.error('Please log in to create assignment request');
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(`${HOSTED_URL}/api/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        ...formData
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to create assignment');

    toast.success('Assignment request created successfully!');
    fetchAssignments(); // Refresh list
    return result.assignment;
  } catch (error) {
    console.error('Error creating assignment:', error);
    toast.error('Failed to create assignment request');
    throw error;
  } finally {
    setLoading(false);
  }
};

  // Get download URL for assignment file
  const getFileUrl = async (filePath: string) => {
  const response = await fetch(`${HOSTED_URL}/api/files/signed-url?path=${encodeURIComponent(filePath)}`);
  const result = await response.json();
  return result.url;
};


  useEffect(() => {
    fetchHelpers();
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  return {
    assignments,
    helpers,
    loading,
    createAssignment,
    fetchAssignments,
    getFileUrl,
    uploadFiles
  };
}