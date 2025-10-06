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
  TrendingUp,
  MessageSquare,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { FacultyManagement } from '@/components/FacultyManagement';

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

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading, error, user } = useAdminAuth();
  
  const [lostFoundRequests, setLostFoundRequests] = useState<LostFoundRequest[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('lost-found');
  const [resaleListings, setResaleListings] = useState<any[]>([]);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [stats, setStats] = useState({
    totalPendingLostFound: 0,
    totalPendingEvents: 0,
    totalPendingResale: 0,
    totalPendingContacts: 0,
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
    
    // Set up real-time subscriptions with notifications for ALL modules
    const lostFoundChannel = supabase
      .channel('lost_found_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lost_found_requests'
      }, (payload) => {
        console.log('🔔 Lost & Found real-time event:', payload);
        fetchData();
        if (payload.eventType === 'INSERT') {
          const newItem = payload.new as any;
          toast.success(`🕵️ New Lost & Found: ${newItem?.title || 'Untitled'}`, {
            description: `${newItem?.item_type === 'lost' ? 'Lost' : 'Found'} item submitted`,
            duration: 5000
          });
        }
      })
      .subscribe((status) => {
        console.log('Lost & Found channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsRealtimeActive(true);
          console.log('✅ Real-time active for Lost & Found');
        }
      });

    const eventRequestsChannel = supabase
      .channel('event_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interview_event_requests'
      }, (payload) => {
        console.log('🔔 Event Request real-time event:', payload);
        fetchData();
        if (payload.eventType === 'INSERT') {
          const newEvent = payload.new as any;
          toast.success(`📅 New Event Request: ${newEvent?.event_name || 'Untitled'}`, {
            description: `${newEvent?.society_name || 'Unknown society'} - ${newEvent?.category || 'Event'}`,
            duration: 5000
          });
        }
      })
      .subscribe();

    const resaleListingsChannel = supabase
      .channel('resale_listings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'resale_listings'
      }, (payload) => {
        console.log('🔔 Resale Listing real-time event:', payload);
        fetchData();
        if (payload.eventType === 'INSERT') {
          const newListing = payload.new as any;
          toast.success(`🛍️ New Resale Listing: ${newListing?.title || 'Untitled'}`, {
            description: `Price: ₹${newListing?.price || '0'}`,
            duration: 5000
          });
        }
      })
      .subscribe();

    const contactsChannel = supabase
      .channel('contacts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        console.log('🔔 Contact Submission real-time event:', payload);
        fetchData();
        if (payload.eventType === 'INSERT') {
          const newContact = payload.new as any;
          toast.success(`💬 New Contact Message: ${newContact?.subject || 'No subject'}`, {
            description: `From: ${newContact?.full_name || 'Unknown'}`,
            duration: 5000
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lostFoundChannel);
      supabase.removeChannel(eventRequestsChannel);
      supabase.removeChannel(resaleListingsChannel);
      supabase.removeChannel(contactsChannel);
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

      // Fetch resale listings
      const { data: resaleReqs } = await supabase
        .from('resale_listings')
        .select(`
          *,
          seller:profiles!seller_id(full_name, email),
          images:resale_listing_images(storage_path)
        `)
        .order('created_at', { ascending: false });

      // Fetch contact submissions
      const { data: contacts } = await supabase
        .from('contacts')
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
      setResaleListings(resaleReqs || []);
      setContactSubmissions(contacts || []);
      setAdminActions(actions || []);
      
      const today = new Date().toISOString().split('T')[0];
      const actionsToday = actions?.filter(action => 
        action.created_at.startsWith(today)
      ).length || 0;
      
      setStats({
        totalPendingLostFound: lfRequests?.filter(r => r.status === 'pending').length || 0,
        totalPendingEvents: eventReqs?.filter(r => r.status === 'pending').length || 0,
        totalPendingResale: resaleReqs?.filter(r => r.status === 'pending').length || 0,
        totalPendingContacts: contacts?.filter(c => c.status === 'new').length || 0,
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

  const handleResaleApprove = async (listing: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-resale-listing', {
        body: { 
          listingId: listing.id,
          action: 'approve',
          adminUserId: user?.id
        }
      });

      if (error) throw error;
      
      toast.success('Listing approved and published! ✅');
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Resale approval error:', error);
      toast.error('Failed to approve listing');
    }
  };

  const handleResaleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('moderate-resale-listing', {
        body: { 
          listingId: selectedItem.id,
          action: 'reject',
          adminUserId: user?.id,
          reason: rejectReason
        }
      });

      if (error) throw error;
      
      toast.success('Listing rejected and seller notified');
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Resale rejection error:', error);
      toast.error('Failed to reject listing');
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    // Handle resale rejection separately
    if (activeTab === 'resale') {
      return handleResaleReject();
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

  const filteredResaleListings = resaleListings.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContacts = contactSubmissions.filter(item => {
    const matchesSearch = item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && item.status === 'new') ||
                         item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleContactStatusUpdate = async (contactId: string, newStatus: 'new' | 'read' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: newStatus })
        .eq('id', contactId);

      if (error) throw error;
      
      toast.success(`Contact marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
    }
  };

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
            <div className="flex items-center gap-3">
              {isRealtimeActive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Live Updates Active</span>
                </div>
              )}
              <Button 
                variant="secondary" 
                onClick={fetchData}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
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
      </div>

      <div className="container mx-auto px-4 py-8 -mt-4">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-400 to-pink-600 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-pink-100 text-sm font-medium mb-1">Pending Resale</p>
                  <p className="text-3xl font-bold">{stats.totalPendingResale}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-teal-100 text-sm font-medium mb-1">New Contacts</p>
                  <p className="text-3xl font-bold">{stats.totalPendingContacts}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
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
                <TabsList className="grid w-full grid-cols-6 bg-gray-100">
                  <TabsTrigger value="lost-found" className="flex items-center gap-2 text-sm font-medium">
                    🕵️ Lost & Found
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2 text-sm font-medium">
                    📅 Events
                  </TabsTrigger>
                  <TabsTrigger value="resale" className="flex items-center gap-2 text-sm font-medium">
                    🛍️ Resale
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="flex items-center gap-2 text-sm font-medium">
                    💬 Contacts
                  </TabsTrigger>
                  <TabsTrigger value="faculty" className="flex items-center gap-2 text-sm font-medium">
                    👥 Faculty
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="flex items-center gap-2 text-sm font-medium">
                    📊 Audit
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Filters */}
              {(activeTab === 'lost-found' || activeTab === 'events' || activeTab === 'resale' || activeTab === 'contacts') && (
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
                      {activeTab === 'contacts' ? (
                        <>
                          <option value="pending">🆕 New</option>
                          <option value="read">👁️ Read</option>
                          <option value="resolved">✅ Resolved</option>
                          <option value="all">📋 All Status</option>
                        </>
                      ) : (
                        <>
                          <option value="pending">⏳ Pending</option>
                          <option value="approved">✅ Approved</option>
                          <option value="rejected">❌ Rejected</option>
                          <option value="all">📋 All Status</option>
                        </>
                      )}
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

              {/* Resale Listings */}
              <TabsContent value="resale" className="p-6 space-y-4">
                {filteredResaleListings.map((listing) => (
                  <Card key={listing.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{listing.title}</h3>
                            <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                              ₹{listing.price}
                            </Badge>
                            <Badge variant={
                              listing.status === 'pending' ? 'secondary' :
                              listing.status === 'active' ? 'default' : 'outline'
                            } className="px-3 py-1 text-xs font-semibold">
                              {listing.status === 'pending' ? '⏳ Pending' :
                               listing.status === 'active' ? '✅ Active' : '❌ Removed'}
                            </Badge>
                            {listing.moderation_notes && (
                              <Badge variant="destructive" className="px-3 py-1 text-xs">
                                🚩 Flagged
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                            {listing.description?.substring(0, 120)}...
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              <span>Category: {listing.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User2 className="w-3 h-3" />
                              <span>Seller: {listing.seller?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{listing.seller?.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {listing.moderation_notes && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                              <strong>⚠️ Auto-moderation flags:</strong> {listing.moderation_notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(listing)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {listing.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleResaleApprove(listing)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(listing);
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
                {filteredResaleListings.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No resale listings match your filters.</p>
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

              {/* Contact Submissions */}
              <TabsContent value="contacts" className="p-6 space-y-4">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{contact.subject}</h3>
                            <Badge variant={
                              contact.status === 'new' ? 'default' :
                              contact.status === 'read' ? 'secondary' : 'outline'
                            } className="px-3 py-1 text-xs font-semibold">
                              {contact.status === 'new' ? '🆕 New' :
                               contact.status === 'read' ? '👁️ Read' : '✅ Resolved'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                            {contact.message.substring(0, 150)}...
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User2 className="w-3 h-3" />
                              <span>{contact.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-col">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(contact)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {contact.status === 'new' && (
                            <Button
                              size="sm"
                              onClick={() => handleContactStatusUpdate(contact.id, 'read')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          {contact.status !== 'resolved' && (
                            <Button
                              size="sm"
                              onClick={() => handleContactStatusUpdate(contact.id, 'resolved')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCheck className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No contact submissions match your filters.</p>
                  </div>
                )}
              </TabsContent>

              {/* Faculty Management */}
              <TabsContent value="faculty" className="p-6">
                <FacultyManagement />
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
              {activeTab === 'contacts' ? '💬' : activeTab === 'lost-found' ? '🕵️' : activeTab === 'resale' ? '🛍️' : '📅'} 
              {selectedItem?.subject || selectedItem?.title || selectedItem?.event_name}
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
              {/* Contact Submission Details */}
              {activeTab === 'contacts' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Full Message</Label>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedItem.message}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Contact Name</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Email</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.email}</p>
                    </div>
                    {selectedItem.phone && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedItem.phone}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Status</Label>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{selectedItem.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Submitted At</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(selectedItem.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedItem.status === 'new' && (
                      <Button 
                        onClick={() => {
                          handleContactStatusUpdate(selectedItem.id, 'read');
                          setSelectedItem(null);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    {selectedItem.status !== 'resolved' && (
                      <Button 
                        onClick={() => {
                          handleContactStatusUpdate(selectedItem.id, 'resolved');
                          setSelectedItem(null);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
              ) : activeTab === 'resale' ? (
                /* Resale Listing Details */
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Description</Label>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedItem.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Price</Label>
                      <p className="text-sm text-gray-600 mt-1">₹{selectedItem.price}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Category</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Condition</Label>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{selectedItem.condition}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Seller</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.seller?.full_name}</p>
                    </div>
                  </div>
                  {selectedItem.moderation_notes && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <Label className="text-sm font-semibold text-red-700 mb-2 block">⚠️ Auto-Moderation Flags</Label>
                      <p className="text-sm text-red-600">{selectedItem.moderation_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedItem.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => {
                            handleResaleApprove(selectedItem);
                            setSelectedItem(null);
                          }}
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
              ) : (
                /* Lost & Found / Events Details */
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
                  <div className="col-span-2 flex gap-3 pt-4 border-t">
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