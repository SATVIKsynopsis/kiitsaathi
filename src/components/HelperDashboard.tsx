import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrintJobCard } from './PrintJobCard';
import { HelperPreferences } from './HelperPreferences';
import { usePrintJobManager } from '@/hooks/usePrintJobManager';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, FileText, Clock, CheckCircle, Settings } from 'lucide-react';

export function HelperDashboard() {
  const { user } = useAuth();
  const { 
    acceptJob, 
    updateJobStatus, 
    downloadFile, 
    sendToShopkeeper,
    notifyStatusUpdate,
    fetchJobs, 
    isLoading 
  } = usePrintJobManager();
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalEarnings: 0, activeJobs: 0 });

  const loadJobs = async () => {
    // Load available jobs
    const available = await fetchJobs({ status: 'pending' });
    setAvailableJobs(available);

    if (user) {
      // Load my accepted/active jobs
      const active = await fetchJobs({ helper_id: user.id });
      const activeJobs = active.filter(job => 
        ['accepted', 'picked', 'printing', 'ready_for_pickup', 'delivered'].includes(job.status)
      );
      const completed = active.filter(job => job.status === 'completed');
      
      setMyJobs(activeJobs);
      setCompletedJobs(completed);

      // Calculate stats
      const totalEarnings = completed.reduce((sum, job) => sum + job.helper_fee, 0);
      setStats({
        totalJobs: completed.length,
        totalEarnings,
        activeJobs: activeJobs.length
      });
    }
  };

  useEffect(() => {
    loadJobs();
    
    // Set up real-time subscription for job updates
    const subscription = supabase
      .channel('print-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_jobs'
        },
        () => {
          loadJobs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleAcceptJob = async (jobId: string) => {
    const success = await acceptJob(jobId);
    if (success) {
      // Send notification to customer
      if (user) {
        await notifyStatusUpdate(jobId, 'accepted', user.email || 'Helper');
      }
      loadJobs();
    }
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    const success = await updateJobStatus(jobId, status);
    if (success) {
      // Send notification to customer
      if (user) {
        await notifyStatusUpdate(jobId, status, user.email || 'Helper');
      }
      loadJobs();
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    await downloadFile(filePath, fileName);
  };

  const handleSendToShopkeeper = async (jobId: string, method: 'email' | 'whatsapp') => {
    await sendToShopkeeper(jobId, method);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-campus-blue/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-campus-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold text-campus-blue">₹{stats.totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Jobs</p>
                <p className="text-xl font-bold text-green-600">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-xl font-bold text-orange-600">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Jobs</p>
                <p className="text-xl font-bold text-purple-600">{availableJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Management Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Available Jobs
            {availableJobs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {availableJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            My Active Jobs
            {stats.activeJobs > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.activeJobs}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
            {stats.totalJobs > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.totalJobs}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Available Jobs */}
        <TabsContent value="available" className="space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-campus-blue">Available Print Jobs</CardTitle>
              <CardDescription>
                Accept jobs to start earning. Files are accessible only after acceptance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No available jobs at the moment</p>
                  <p className="text-sm">Check back later for new print requests!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableJobs.map((job) => (
                    <PrintJobCard
                      key={job.id}
                      job={job}
                      userType="helper"
                      onAccept={handleAcceptJob}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Jobs */}
        <TabsContent value="active" className="space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-campus-blue">My Active Jobs</CardTitle>
              <CardDescription>
                Manage your accepted print jobs and update their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active jobs</p>
                  <p className="text-sm">Accept jobs from the available tab to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myJobs.map((job) => (
                    <PrintJobCard
                      key={job.id}
                      job={job}
                      userType="helper"
                      onUpdateStatus={handleUpdateStatus}
                      onDownload={handleDownloadFile}
                      onSendToShopkeeper={handleSendToShopkeeper}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Jobs */}
        <TabsContent value="completed" className="space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-campus-blue">Completed Jobs</CardTitle>
              <CardDescription>
                View your job history and earnings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed jobs yet</p>
                  <p className="text-sm">Complete your first job to see it here!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedJobs.map((job) => (
                    <PrintJobCard
                      key={job.id}
                      job={job}
                      userType="helper"
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Helper Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <HelperPreferences />
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <Card className="glassmorphism border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Privacy & Confidentiality Notice</h4>
              <p className="text-sm text-yellow-700">
                Please do not share confidential or sensitive documents with anonymous helpers. 
                The platform is not responsible for any data leaks. Only files from accepted jobs 
                are accessible to you, and access is automatically revoked after job completion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}