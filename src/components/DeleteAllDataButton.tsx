import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteAllDataButtonProps {
  onDataDeleted?: () => void;
}

export function DeleteAllDataButton({ onDataDeleted }: DeleteAllDataButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAllData = async () => {
    if (!user) return;
    
    if (confirmText !== 'DELETE ALL MY DATA') {
      toast.error('Please type "DELETE ALL MY DATA" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_all_resume_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      if (data) {
        toast.success('✅ All personal data permanently deleted from our servers');
        setIsOpen(false);
        onDataDeleted?.();
        
        // Clear the confirmation text
        setConfirmText('');
        
        // Reload page after brief delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error("Unable to delete data");
      }
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700 border-2 border-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          🗑️ Delete All Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete All Personal Data
          </DialogTitle>
          <DialogDescription>
            This will permanently delete all your resume data from our servers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive" className="border-red-200">
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>This action cannot be undone!</strong> The following will be permanently deleted:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• All saved resumes and templates</li>
                <li>• Download history and usage data</li>
                <li>• Personal information (name, email, phone, etc.)</li>
                <li>• All work experience and education data</li>
                <li>• Skills, projects, and certifications</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div>
            <label className="text-sm font-medium text-red-700">
              Type "DELETE ALL MY DATA" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE ALL MY DATA"
              className="w-full mt-2 px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setConfirmText('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllData}
              disabled={isDeleting || confirmText !== 'DELETE ALL MY DATA'}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete Forever'}
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Your data privacy is our priority. This ensures complete removal from our systems.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}