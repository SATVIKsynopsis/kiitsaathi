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
  ArrowLeft,
  AlertTriangle,
  Activity,
  MapPin,
  Mail,
  Phone,
  Building,
  User2,
  Sparkles,
  TrendingUp
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
    
    // Set up real-time subscriptions
    const lostFoundChannel = supabase
      .channel('lost_found_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lost_found_requests'
      }, () => {
        fetchData();
      })
      .subscribe();

    const eventRequestsChannel = supabase
      .channel('event_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interview_event_requests'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lostFoundChannel);
      supabase.removeChannel(eventRequestsChannel);
    };
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
      
      toast.success(`${type === 'lost-found' ? 'Item' : 'Event'} approved and published successfully! ✅`);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-xl border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-700 text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-blue-100 text-lg">
                  Welcome back, <span className="font-semibold">{user?.email}</span> • Manage KIIT Saathi
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-4">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Pending Lost & Found</p>
                  <p className="text-3xl font-bold">{stats.totalPendingLostFound}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Pending Events</p>
                  <p className="text-3xl font-bold">{stats.totalPendingEvents}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-400 to-green-600 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Actions Today</p>
                  <p className="text-3xl font-bold">{stats.totalActionsToday}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 px-6 pt-6">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger value="lost-found" className="flex items-center gap-2 text-sm font-medium">
                    🕵️ Lost & Found Requests
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2 text-sm font-medium">
                    📅 Event Requests
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="flex items-center gap-2 text-sm font-medium">
                    📊 Audit Log
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Filters */}
              {(activeTab === 'lost-found' || activeTab === 'events') && (
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder={`Search ${activeTab === 'lost-found' ? 'items' : 'events'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500 text-sm font-medium min-w-[160px]"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="approved">✅ Approved</option>
                      <option value="rejected">❌ Rejected</option>
                      <option value="all">📋 All Status</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Lost & Found Requests */}
              <TabsContent value="lost-found" className="p-6 space-y-4">
                {filteredLostFound.map((item) => (
                  <Card key={item.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                            <Badge 
                              variant={item.item_type === 'lost' ? 'destructive' : 'default'}
                              className="px-3 py-1 text-xs font-semibold"
                            >
                              {item.item_type === 'lost' ? '🔍 Lost' : '🎯 Found'}
                            </Badge>
                            <Badge variant={
                              item.status === 'pending' ? 'secondary' :
                              item.status === 'approved' ? 'default' : 'outline'
                            } className="px-3 py-1 text-xs font-semibold">
                              {item.status === 'pending' ? '⏳ Pending' :
                               item.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                            {item.description.substring(0, 120)}...
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{item.contact_email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              <span>{item.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(item, 'lost-found')}
                                className="bg-green-600 hover:bg-green-700 text-white"
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
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No lost & found requests match your filters.</p>
                  </div>
                )}
              </TabsContent>

              {/* Event Requests */}
              <TabsContent value="events" className="p-6 space-y-4">
                {filteredEvents.map((item) => (
                  <Card key={item.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{item.event_name}</h3>
                            <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                              {item.category}
                            </Badge>
                            <Badge variant={
                              item.status === 'pending' ? 'secondary' :
                              item.status === 'approved' ? 'default' : 'outline'
                            } className="px-3 py-1 text-xs font-semibold">
                              {item.status === 'pending' ? '⏳ Pending' :
                               item.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                            {item.description.substring(0, 120)}...
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              <span>{item.society_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.venue}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User2 className="w-3 h-3" />
                              <span>{item.organiser}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(item, 'event')}
                                className="bg-green-600 hover:bg-green-700 text-white"
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
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No event requests match your filters.</p>
                  </div>
                )}
              </TabsContent>

              {/* Audit Log */}
              <TabsContent value="audit" className="p-6">
                <div className="space-y-3">
                  {adminActions.map((action) => (
                    <Card key={action.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              action.action_type.includes('approve') ? 'bg-green-100 text-green-700' :
                              action.action_type.includes('reject') ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {action.action_type.includes('approve') ? '✓' :
                               action.action_type.includes('reject') ? '✗' : '◆'}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {action.action_type.replace(/_/g, ' ').toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-500">
                                by {action.admin_email} • {new Date(action.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {action.reason && (
                            <Badge variant="outline" className="text-xs">
                              Reason provided
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {adminActions.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg">No admin actions recorded yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={selectedItem && !showRejectDialog} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {activeTab === 'lost-found' ? '🕵️' : '📅'} 
              {selectedItem?.title || selectedItem?.event_name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {selectedItem.image_url && (
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedItem.image_url} 
                    alt="Item" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedItem.description}</p>
                </div>
                {activeTab === 'lost-found' ? (
                  <>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Location</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.location}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Contact</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedItem.contact_name}<br/>
                        {selectedItem.contact_email}<br/>
                        {selectedItem.contact_phone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Category</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.category}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Society</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.society_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Date & Time</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(selectedItem.event_date).toLocaleDateString()}<br/>
                        {selectedItem.start_time} - {selectedItem.end_time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Venue</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.venue}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Organiser</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.organiser}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t">
                {selectedItem.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => handleApprove(selectedItem, activeTab as 'lost-found' | 'event')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Publish
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this submission. The user will be notified with this reason.
            </p>
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleReject} variant="destructive" className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Reject & Notify User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}