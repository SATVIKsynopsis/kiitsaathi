import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Calendar,
  Shield,
  Users,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

interface LostFoundRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  item_type: 'lost' | 'found';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  requester_email: string;
  created_at: string;
}

interface EventRequest {
  id: string;
  event_name: string;
  description: string;
  society_name: string;
  category: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  venue: string;
  organiser: string;
  requirements?: string[];
  status: 'pending' | 'approved' | 'rejected';
  requester_email: string;
  created_at: string;
}

interface AdminAction {
  id: string;
  admin_email: string;
  action_type: string;
  target_table: string;
  target_id: string;
  payload: any;
  reason?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading, error, user } = useAdminAuth();
  
  const [lostFoundRequests, setLostFoundRequests] = useState<LostFoundRequest[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('lost-found');
  const [stats, setStats] = useState({
    totalPendingLostFound: 0,
    totalPendingEvents: 0,
    totalActionsToday: 0,
    totalUsers: 0
  });

  useEffect(() => {
    if (loading) return;
    
    if (!isAdmin) {
      toast.error('Access denied - Admin privileges required');
      navigate('/');
      return;
    }
    
    fetchData();
  }, [isAdmin, loading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch lost & found requests
      const { data: lfRequests } = await supabase
        .from('lost_found_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch event requests  
      const { data: eventReqs } = await supabase
        .from('interview_event_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Fetch admin actions
      const { data: actions } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setLostFoundRequests(lfRequests || []);
      setEventRequests(eventReqs || []);
      setAdminActions(actions || []);
      
      const today = new Date().toISOString().split('T')[0];
      const actionsToday = actions?.filter(action => 
        action.created_at.startsWith(today)
      ).length || 0;
      
      setStats({
        totalPendingLostFound: lfRequests?.filter(r => r.status === 'pending').length || 0,
        totalPendingEvents: eventReqs?.filter(r => r.status === 'pending').length || 0,
        totalActionsToday: actionsToday,
        totalUsers: totalUsers || 0
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    }
  };

  const handleApprove = async (item: any, type: 'lost-found' | 'event') => {
    try {
      const functionName = type === 'lost-found' ? 'admin-approve-lost-item' : 'admin-approve-event';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          requestId: item.id, 
          adminUserId: user?.id 
        }
      });

      if (error) throw error;
      
      toast.success(`${type === 'lost-found' ? 'Item' : 'Event'} approved successfully!`);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const functionName = activeTab === 'lost-found' ? 'admin-reject-lost-item' : 'admin-reject-event';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          requestId: selectedItem.id, 
          reason: rejectReason,
          adminUserId: user?.id 
        }
      });

      if (error) throw error;
      
      toast.success('Item rejected and user notified');
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'You do not have admin privileges to access this dashboard.'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLostFound = lostFoundRequests.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEvents = eventRequests.filter(item => {
    const matchesSearch = item.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.society_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.email} • Manage KIIT Saathi content moderation
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Lost & Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  {stats.totalPendingLostFound}
                </span>
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {stats.totalPendingEvents}
                </span>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Actions Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalActionsToday}
                </span>
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {stats.totalUsers}
                </span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lost-found">Lost & Found Requests</TabsTrigger>
            <TabsTrigger value="events">Event Requests</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Filters */}
          {(activeTab === 'lost-found' || activeTab === 'events') && (
            <div className="flex gap-4 my-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab === 'lost-found' ? 'items' : 'events'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All Status</option>
                </select>
              </div>
            </div>
          )}

          <TabsContent value="lost-found" className="space-y-4">
            {filteredLostFound.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant={item.item_type === 'lost' ? 'destructive' : 'default'}>
                          {item.item_type}
                        </Badge>
                        <Badge variant={
                          item.status === 'pending' ? 'secondary' :
                          item.status === 'approved' ? 'default' : 'outline'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📍 {item.location}</span>
                        <span>📧 {item.requester_email}</span>
                        <span>🕒 {new Date(item.created_at).toLocaleDateString()}</span>
                        <span>📂 {item.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(item, 'lost-found')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredLostFound.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No lost & found requests match your filters.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {filteredEvents.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{item.event_name}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant={
                          item.status === 'pending' ? 'secondary' :
                          item.status === 'approved' ? 'default' : 'outline'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>🏢 {item.society_name}</span>
                        <span>📅 {item.event_date}</span>
                        <span>🕒 {item.start_time}-{item.end_time}</span>
                        <span>📍 {item.venue}</span>
                        <span>📧 {item.requester_email}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(item, 'event')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No event requests match your filters.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            {adminActions.map((action) => (
              <Card key={action.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{action.action_type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          by {action.admin_email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: {action.target_table} • {action.target_id}
                        {action.reason && ` • Reason: ${action.reason}`}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(action.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {adminActions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No admin actions recorded yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem && !showRejectDialog} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.title || selectedItem?.event_name} Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.image_url && (
                <img 
                  src={selectedItem.image_url} 
                  alt="Item" 
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type:</strong> {selectedItem.item_type || selectedItem.category}
                </div>
                <div>
                  <strong>Status:</strong> {selectedItem.status}
                </div>
                <div>
                  <strong>Contact:</strong> {selectedItem.contact_name || selectedItem.organiser}
                </div>
                <div>
                  <strong>Email:</strong> {selectedItem.requester_email}
                </div>
                {selectedItem.contact_phone && (
                  <div>
                    <strong>Phone:</strong> {selectedItem.contact_phone}
                  </div>
                )}
                <div>
                  <strong>Date:</strong> {selectedItem.event_date || new Date(selectedItem.created_at).toLocaleDateString()}
                </div>
                {selectedItem.location && (
                  <div>
                    <strong>Location:</strong> {selectedItem.location}
                  </div>
                )}
                {selectedItem.venue && (
                  <div>
                    <strong>Venue:</strong> {selectedItem.venue}
                  </div>
                )}
              </div>
              <div>
                <strong>Description:</strong>
                <p className="mt-1 text-muted-foreground">{selectedItem.description}</p>
              </div>
              {selectedItem.requirements && selectedItem.requirements.length > 0 && (
                <div>
                  <strong>Requirements:</strong>
                  <ul className="mt-1 list-disc list-inside text-muted-foreground">
                    {selectedItem.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a clear reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject & Notify User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}