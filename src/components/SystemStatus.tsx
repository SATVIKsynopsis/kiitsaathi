import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function SystemStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'checking' | 'ready' | 'issues'>('checking');
  const [checks, setChecks] = useState({
    auth: false,
    database: false,
    storage: false,
    policies: false
  });

  useEffect(() => {
    checkSystemStatus();
  }, [user]);

  const checkSystemStatus = async () => {
    const newChecks = { auth: false, database: false, storage: false, policies: false };
    
    try {
      // Check auth
      newChecks.auth = !!user;
      
      // Check database connection
      try {
        const { error } = await supabase.from('print_jobs').select('count').limit(1);
        newChecks.database = !error;
      } catch (e) {
        newChecks.database = false;
      }
      
      // Check storage connection
      try {
        const { error } = await supabase.storage.from('print-job-files').list('', { limit: 1 });
        newChecks.storage = !error;
      } catch (e) {
        newChecks.storage = false;
      }
      
      // Check policies (simple test)
      if (user) {
        try {
          const { error } = await supabase.from('print_jobs').select('*').eq('user_id', user.id).limit(1);
          newChecks.policies = !error;
        } catch (e) {
          newChecks.policies = false;
        }
      }
      
      setChecks(newChecks);
      
      // Determine overall status
      const allReady = newChecks.auth && newChecks.database && newChecks.storage && newChecks.policies;
      const hasIssues = !newChecks.database || !newChecks.storage;
      
      setStatus(hasIssues ? 'issues' : (allReady ? 'ready' : 'checking'));
      
    } catch (error) {
      console.error('System status check failed:', error);
      setStatus('issues');
    }
  };

  const StatusIcon = ({ checked }: { checked: boolean }) => 
    checked ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'bg-green-100 border-green-200';
      case 'issues': return 'bg-red-100 border-red-200';
      default: return 'bg-yellow-100 border-yellow-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready': return '✅ System Ready';
      case 'issues': return '❌ System Issues';
      default: return '🔄 Checking...';
    }
  };

  return (
    <Card className={`${getStatusColor()} glassmorphism`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg">{getStatusText()}</div>
            {status === 'ready' && <Badge variant="secondary" className="bg-green-200 text-green-800">Print Service Online</Badge>}
            {status === 'issues' && <Badge variant="destructive">Service Offline</Badge>}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <StatusIcon checked={checks.auth} />
              <span>Auth</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon checked={checks.database} />
              <span>DB</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon checked={checks.storage} />
              <span>Files</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon checked={checks.policies} />
              <span>Access</span>
            </div>
          </div>
        </div>
        
        {status === 'ready' && user && (
          <p className="text-sm text-green-700 mt-2">
            Ready to submit print jobs! All systems operational.
          </p>
        )}
        
        {!user && (
          <p className="text-sm text-yellow-700 mt-2">
            Sign in to access print job submission
          </p>
        )}
        
        {status === 'issues' && (
          <p className="text-sm text-red-700 mt-2">
            Some services are offline. Please try again later or contact support.
          </p>
        )}
      </CardContent>
    </Card>
  );
}