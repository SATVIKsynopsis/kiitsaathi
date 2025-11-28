import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, ArrowLeft, Plus, Trash2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const FoodAdminShopkeepers = () => {
  const { user, accessToken } = useAuth();
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [selectedShop, setSelectedShop] = useState("");

  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

  // Fetch shops
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shops`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch shops');
      const data = await response.json();
      return data.shops;
    },
  });

  // Fetch shopkeeper emails
  const { data: shopkeeperEmails, isLoading: emailsLoading } = useQuery({
    queryKey: ['shopkeeper-emails'],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shopkeeper-emails`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();
      return data.emails;
    },
  });

  // Add shopkeeper email mutation
  const addEmailMutation = useMutation({
    mutationFn: async ({ email, shopId }: { email: string; shopId: string }) => {
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shopkeeper-emails`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, shopId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add email');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopkeeper-emails'] });
      toast({ title: "Shopkeeper email added successfully" });
      setEmail("");
      setSelectedShop("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add shopkeeper email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete shopkeeper email mutation
  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shopkeeper-emails/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete email');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopkeeper-emails'] });
      toast({ title: "Shopkeeper email removed" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddEmail = () => {
    if (!email.trim()) {
      toast({ title: "Please enter an email", variant: "destructive" });
      return;
    }
    if (!selectedShop) {
      toast({ title: "Please select a shop", variant: "destructive" });
      return;
    }
    addEmailMutation.mutate({ email, shopId: selectedShop });
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-24">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">Admin access required</p>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Shopkeepers</h1>
              <p className="text-muted-foreground">Add shopkeeper emails and assign them to shops</p>
            </div>
            <Button onClick={() => navigate('/food/admin')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Admin
            </Button>
          </div>

          {/* Add Shopkeeper Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Shopkeeper Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shopkeeper@example.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="shop">Assign to Shop</Label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shopsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        shops?.map((shop: any) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddEmail} 
                    disabled={addEmailMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {addEmailMutation.isPending ? "Adding..." : "Add Shopkeeper"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                When a user signs up with this email, they will automatically be assigned the shopkeeper role and access to manage the selected shop.
              </p>
            </CardContent>
          </Card>

          {/* Shopkeeper Emails Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Registered Shopkeeper Emails
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emailsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : shopkeeperEmails && shopkeeperEmails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopkeeperEmails.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.email}</TableCell>
                        <TableCell>{entry.shops?.name || 'No shop assigned'}</TableCell>
                        <TableCell>
                          {entry.assigned ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending Signup</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(entry.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEmailMutation.mutate(entry.id)}
                            disabled={deleteEmailMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No shopkeeper emails registered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FoodAdminShopkeepers;

