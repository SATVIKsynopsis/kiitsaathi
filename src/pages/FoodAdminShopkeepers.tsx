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
import { ShieldAlert, ArrowLeft, Plus, Trash2, Mail, CheckCircle, Eye, EyeOff } from "lucide-react";
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
    // Try both accessToken and localStorage as fallback
    const token = accessToken || localStorage.getItem('access_token');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [createdShopkeepers, setCreatedShopkeepers] = useState<any[]>([]);
  const [passwordVisibility, setPasswordVisibility] = useState<{[key: string]: boolean}>({});

  const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';

  // Fetch shops
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      const response = await fetch(`https://kiitsaathi-hosted.onrender.com/api/food/admin/shops`, {
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

  // Add shopkeeper account mutation
  const addShopkeeperMutation = useMutation({
    mutationFn: async ({ email, password, shopId }: { email: string; password: string; shopId: string }) => {
      const response = await fetch(`${HOSTED_URL}/api/food/admin/create-shopkeeper`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password, shopId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create shopkeeper account');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Add to created shopkeepers list with credentials
      setCreatedShopkeepers(prev => [...prev, {
        email: email,
        password: password,
        shopId: selectedShop,
        loginEmail: data.shopkeeper?.loginCredentials?.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      }]);
      
      queryClient.invalidateQueries({ queryKey: ['shopkeeper-emails'] });
      toast({ 
        title: "Shopkeeper account created successfully",
        description: `Login email: ${data.shopkeeper?.loginCredentials?.email || 'Generated'}` 
      });
      setEmail("");
      setPassword("");
      setSelectedShop("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create shopkeeper account",
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

  const togglePasswordVisibility = (email: string) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const handleAddShopkeeper = () => {
    if (!email.trim()) {
      toast({ title: "Please enter an email", variant: "destructive" });
      return;
    }
    if (!password.trim()) {
      toast({ title: "Please enter a password", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (!selectedShop) {
      toast({ title: "Please select a shop", variant: "destructive" });
      return;
    }
    addShopkeeperMutation.mutate({ email, password, shopId: selectedShop });
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
              <p className="text-muted-foreground">Create shopkeeper accounts with login credentials and shop assignments</p>
            </div>
            <Button onClick={() => navigate('/food/admin/complete')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Admin
            </Button>
          </div>

          {/* Information Banner */}
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Complete Shopkeeper Account Creation
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">
                    This creates full shopkeeper accounts with converted login emails (@kiit.ac.in format) and passwords. 
                    Click the eye icon to view passwords.
                  </p>
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs text-blue-800 dark:text-blue-200">
                    <strong>Important:</strong> Shopkeepers must use the "Login Email" (converted format) to sign in, not their original @shop.com email.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Shopkeeper Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create Shopkeeper Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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
                    onClick={handleAddShopkeeper} 
                    disabled={addShopkeeperMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {addShopkeeperMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This will create a complete shopkeeper account with login credentials and assign them to the selected shop. The shopkeeper can immediately log in and start managing their shop.
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
                      <TableHead>Original Email</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Login Credentials</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Show newly created shopkeepers with credentials */}
                    {createdShopkeepers.map((shopkeeper: any, index: number) => {
                      const shop = shops?.find((s: any) => s.id === shopkeeper.shopId);
                      const isPasswordVisible = passwordVisibility[shopkeeper.email] || false;
                      
                      return (
                        <TableRow key={`created-${index}`} className="bg-blue-50 dark:bg-blue-950">
                          <TableCell className="font-medium">{shopkeeper.email}</TableCell>
                          <TableCell>
                            {shop?.shop_name || "No shop assigned"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600">
                                <strong>Login Email:</strong> {shopkeeper.loginEmail || 'Generating...'}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Password:</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {isPasswordVisible ? shopkeeper.password : '••••••••'}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePasswordVisibility(shopkeeper.email)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isPasswordVisible ? 
                                      <EyeOff className="h-3 w-3" /> : 
                                      <Eye className="h-3 w-3" />
                                    }
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                              Pending First Login
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(shopkeeper.createdAt).toLocaleTimeString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCreatedShopkeepers(prev => 
                                  prev.filter((_, i) => i !== index)
                                );
                                toast({ title: "Removed from display" });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {/* Show existing shopkeepers from database */}
                    {shopkeeperEmails.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.email}</TableCell>
                        <TableCell>{entry.shops?.name || 'No shop assigned'}</TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            Login managed by system
                          </div>
                        </TableCell>
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
              ) : createdShopkeepers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Original Email</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Login Credentials</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {createdShopkeepers.map((shopkeeper: any, index: number) => {
                      const shop = shops?.find((s: any) => s.id === shopkeeper.shopId);
                      const isPasswordVisible = passwordVisibility[shopkeeper.email] || false;
                      
                      return (
                        <TableRow key={`created-${index}`} className="bg-blue-50 dark:bg-blue-950">
                          <TableCell className="font-medium">{shopkeeper.email}</TableCell>
                          <TableCell>
                            {shop?.shop_name || "No shop assigned"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600">
                                <strong>Login Email:</strong> {shopkeeper.loginEmail || 'Generating...'}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Password:</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {isPasswordVisible ? shopkeeper.password : '••••••••'}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePasswordVisibility(shopkeeper.email)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isPasswordVisible ? 
                                      <EyeOff className="h-3 w-3" /> : 
                                      <Eye className="h-3 w-3" />
                                    }
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                              Pending First Login
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(shopkeeper.createdAt).toLocaleTimeString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCreatedShopkeepers(prev => 
                                  prev.filter((_, i) => i !== index)
                                );
                                toast({ title: "Removed from display" });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
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

