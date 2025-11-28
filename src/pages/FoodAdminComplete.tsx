import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ShieldAlert, Plus, Edit, Trash, Download, QrCode, Store, Ticket, BarChart } from "lucide-react";
import AdminShopForm from "@/components/food/AdminShopForm";
import AdminBatchForm from "@/components/food/AdminBatchForm";
import { useToast } from "@/hooks/use-toast";

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

const FoodAdminComplete = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  const { data: shops, refetch: refetchShops } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: batches, refetch: refetchBatches } = useQuery({
    queryKey: ['admin-batches'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${HOSTED_URL}/api/food/admin/batches`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch batches');
      const result = await response.json();
      return result.batches;
    }
  });

  const { data: redemptions } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${HOSTED_URL}/api/food/admin/redemptions`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch redemptions');
      const result = await response.json();
      return result.redemptions;
    }
  });

  const { data: flaggedAttempts } = useQuery({
    queryKey: ['admin-flagged'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${HOSTED_URL}/api/food/admin/flagged`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch flagged attempts');
      const result = await response.json();
      return result.flaggedAttempts;
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Admin access required</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteShop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shops/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to delete shop');
      toast({ title: "Shop deleted successfully" });
      refetchShops();
    } catch (error) {
      toast({ title: "Error deleting shop", variant: "destructive" });
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${HOSTED_URL}/api/food/admin/batches/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to delete batch');
      toast({ title: "Batch deleted successfully" });
      refetchBatches();
    } catch (error) {
      toast({ title: "Error deleting batch", variant: "destructive" });
    }
  };

  const exportRedemptions = () => {
    if (!redemptions) return;
    const csv = [
      ['Date', 'Shop', 'Coupon Code', 'Discount', 'Location', 'Notes'].join(','),
      ...redemptions.map(r => [
        new Date(r.created_at).toLocaleDateString(),
        r.shops.name,
        r.coupons.code,
        `₹${r.coupons.discount_value}`,
        r.location || '',
        r.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redemptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({ title: "CSV exported successfully!" });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Food Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/food/admin/shopkeepers')} variant="outline">
              <Store className="mr-2 h-5 w-5" />
              Manage Shopkeepers
            </Button>
            <Button onClick={() => navigate('/food/admin/redeem')} variant="outline">
              <QrCode className="mr-2 h-5 w-5" />
              Redeem Coupons
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shops?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {batches?.filter(b => b.is_active).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{redemptions?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Flagged</CardTitle>
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {flaggedAttempts?.filter(f => f.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shops" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="batches">Coupon Batches</TabsTrigger>
            <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
          </TabsList>

          {/* Shops Tab */}
          <TabsContent value="shops">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Shops</CardTitle>
                <Dialog open={showShopForm} onOpenChange={setShowShopForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setSelectedShop(null); setShowShopForm(true); }}>
                      <Plus className="mr-2 h-5 w-5" />
                      Add Shop
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <AdminShopForm 
                      shop={selectedShop}
                      onSuccess={() => {
                        setShowShopForm(false);
                        refetchShops();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shops?.map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell className="font-medium">{shop.name}</TableCell>
                        <TableCell>{shop.address}</TableCell>
                        <TableCell>{shop.contact_number}</TableCell>
                        <TableCell>
                          <Badge variant={shop.is_active ? "default" : "secondary"}>
                            {shop.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedShop(shop);
                                setShowShopForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteShop(shop.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Coupon Batches</CardTitle>
                <Dialog open={showBatchForm} onOpenChange={setShowBatchForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setSelectedBatch(null); setShowBatchForm(true); }}>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Batch
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <AdminBatchForm 
                      batch={selectedBatch}
                      onSuccess={() => {
                        setShowBatchForm(false);
                        refetchBatches();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches?.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batch_name}</TableCell>
                        <TableCell>{batch.shops.name}</TableCell>
                        <TableCell>₹{batch.amount_per_coupon}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Daily: {batch.daily_limit}</div>
                            <div>Per User: {batch.per_user_limit}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={batch.is_active ? "default" : "secondary"}>
                            {batch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBatch(batch);
                                setShowBatchForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteBatch(batch.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redemptions Tab */}
          <TabsContent value="redemptions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Redemption History</CardTitle>
                <Button onClick={exportRedemptions} variant="outline">
                  <Download className="mr-2 h-5 w-5" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions?.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          {new Date(redemption.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{redemption.shops.name}</TableCell>
                        <TableCell className="font-mono">{redemption.coupons.code}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ₹{redemption.coupons.discount_value}
                        </TableCell>
                        <TableCell>{redemption.location || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Tab */}
          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Coupon Code</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedAttempts?.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>{new Date(attempt.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-mono">{attempt.coupon_code}</TableCell>
                        <TableCell>{attempt.reason}</TableCell>
                        <TableCell>
                          <Badge variant={attempt.status === 'pending' ? 'destructive' : 'secondary'}>
                            {attempt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FoodAdminComplete;