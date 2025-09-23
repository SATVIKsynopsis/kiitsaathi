import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function PrintJobTester() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing database connection...');
      
      const { data, error } = await supabase
        .from('print_jobs')
        .select('count')
        .limit(1);
        
      if (error) {
        console.error('Database test error:', error);
        toast.error(`Database error: ${error.message}`);
      } else {
        console.log('Database connection successful');
        toast.success('✅ Database connection working!');
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testStorageConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing storage connection...');
      
      const { data, error } = await supabase.storage
        .from('print-job-files')
        .list('', { limit: 1 });
        
      if (error) {
        console.error('Storage test error:', error);
        toast.error(`Storage error: ${error.message}`);
      } else {
        console.log('Storage connection successful');
        toast.success('✅ Storage connection working!');
      }
    } catch (error: any) {
      console.error('Storage test failed:', error);
      toast.error(`Storage failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testAuth = () => {
    if (user) {
      console.log('User authenticated:', user.id);
      toast.success(`✅ Authenticated as: ${user.email}`);
    } else {
      console.log('No user authenticated');
      toast.error('❌ Not authenticated - please sign in');
    }
  };

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-campus-blue">🔧 System Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={testAuth}
            variant="outline" 
            className="flex flex-col items-center gap-2 h-20"
          >
            👤 Test Auth
            <span className="text-xs">Check login status</span>
          </Button>
          
          <Button 
            onClick={testDatabaseConnection}
            variant="outline" 
            disabled={isLoading}
            className="flex flex-col items-center gap-2 h-20"
          >
            🗄️ Test Database
            <span className="text-xs">Check DB connection</span>
          </Button>
          
          <Button 
            onClick={testStorageConnection}
            variant="outline" 
            disabled={isLoading}
            className="flex flex-col items-center gap-2 h-20"
          >
            📁 Test Storage
            <span className="text-xs">Check file upload</span>
          </Button>
        </div>
        
        {user && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              ✅ Ready to submit print jobs
            </p>
            <p className="text-xs text-green-600 mt-1">
              User ID: {user.id}
            </p>
          </div>
        )}
        
        {!user && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">
              ⚠️ Please sign in to test print job submission
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}