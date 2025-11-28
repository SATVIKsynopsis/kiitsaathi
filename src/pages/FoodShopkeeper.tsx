import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ArrowLeft, QrCode, Eye, MousePointerClick, Phone, Save, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "@/components/food/QRScanner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const FoodShopkeeper = () => {
  const { user, accessToken } = useAuth();

  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

  
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
  const [showScanner, setShowScanner] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);

  // Fetch shopkeeper's assigned shop and shop details
  const { data: shopkeeperData, isLoading: staffLoading } = useQuery({
    queryKey: ['shopkeeper-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch(`${HOSTED_URL}/api/food/shopkeeper/shop`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) return null; // Not a shopkeeper
        throw new Error('Failed to fetch shopkeeper data');
      }
      const data = await response.json();
      if (data.shop) {
        setContactNumber(data.shop.contact_number || "");
      }
      return data;
    },
    enabled: !!user,
  });

  const shopStaff = shopkeeperData?.shopStaff;
  const shop = shopkeeperData?.shop;
  const shopLoading = false; // Combined into single query

  // Fetch active coupon batch for this shop
  const { data: activeBatch, isLoading: batchLoading } = useQuery({
    queryKey: ['shopkeeper-batch', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch(`${HOSTED_URL}/api/food/shopkeeper/batch`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) return null;
        throw new Error('Failed to fetch batch');
      }
      const data = await response.json();
      if (data.batch) {
        setDiscountAmount(data.batch.amount_per_coupon?.toString() || "");
      }
      return data.batch;
    },
    enabled: !!user,
  });

  // Fetch shop view analytics
  const { data: analytics } = useQuery({
    queryKey: ['shop-analytics', shop?.id],
    queryFn: async () => {
      if (!shop?.id) return null;
      const response = await fetch(`${HOSTED_URL}/api/food/shop/${shop.id}/analytics`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) return { cardClicks: 0, pageViews: 0 };
      return await response.json();
    },
    enabled: !!shop?.id,
  });

  // Update contact number mutation
  const updateContactMutation = useMutation({
    mutationFn: async (newContact: string) => {
      if (!shop?.id) throw new Error("No shop found");
      const response = await fetch(`${HOSTED_URL}/api/food/shop/${shop.id}/contact`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ contactNumber: newContact })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopkeeper-data'] });
      toast({ title: "Contact number updated successfully" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update contact number", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update discount amount mutation
  const updateDiscountMutation = useMutation({
    mutationFn: async (newAmount: number) => {
      const response = await fetch(`${HOSTED_URL}/api/food/shopkeeper/batch/discount`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ discountAmount: newAmount })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update discount');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopkeeper-batch'] });
      toast({ title: "Discount amount updated successfully" });
      setIsEditingDiscount(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update discount amount",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveContact = () => {
    if (!contactNumber.trim()) {
      toast({ title: "Please enter a contact number", variant: "destructive" });
      return;
    }
    updateContactMutation.mutate(contactNumber);
  };

  const handleSaveDiscount = () => {
    const amount = parseFloat(discountAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Please enter a valid discount amount", variant: "destructive" });
      return;
    }
    updateDiscountMutation.mutate(amount);
  };

  const handleScan = async (scannedCode: string) => {
    setShowScanner(false);
    
    try {
      const response = await fetch(`${HOSTED_URL}/api/food/redeem-coupon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          couponCode: scannedCode // The QR code contains the coupon code directly
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Redemption failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Coupon Redeemed Successfully!",
          description: `Discount: ₹${data.coupon.amount || data.coupon.discount_value}`,
        });
      } else {
        throw new Error(data.message || 'Redemption failed');
      }
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-24">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">Shopkeeper access required</p>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (staffLoading || shopLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background p-6 pt-24">
          <div className="container mx-auto max-w-6xl">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!shopStaff || !shop) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-24">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">No shop assigned</p>
              <p className="text-sm text-muted-foreground mb-4">
                You are not assigned to any shop. Please contact admin.
              </p>
              <Button onClick={() => navigate('/food')}>Go to Food Directory</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (showScanner) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background p-6 pt-24">
          <div className="container mx-auto max-w-2xl">
            <Button
              variant="outline"
              size="icon"
              className="mb-6"
              onClick={() => setShowScanner(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-6 pt-24 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Shopkeeper Dashboard</h1>
              <p className="text-muted-foreground">Managing: {shop.name}</p>
            </div>
            <Button onClick={() => navigate('/food')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Directory
            </Button>
          </div>

          {/* Analytics Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  Service Card Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{analytics?.cardClicks || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total clicks on your shop card in the directory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Full Page Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{analytics?.pageViews || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total views on your shop's detail page
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Discount Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Discount Amount Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="discount">Discount Amount (₹)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="Enter discount amount"
                    disabled={!isEditingDiscount}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    This amount will be applied to all coupons generated for your shop
                  </p>
                </div>
                <div className="flex items-end gap-2 pb-7">
                  {!isEditingDiscount ? (
                    <Button onClick={() => setIsEditingDiscount(true)}>Edit</Button>
                  ) : (
                    <>
                      <Button onClick={handleSaveDiscount} disabled={updateDiscountMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateDiscountMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDiscountAmount(activeBatch?.amount_per_coupon?.toString() || "");
                          setIsEditingDiscount(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Number Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="contact">Phone Number</Label>
                  <Input
                    id="contact"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter contact number"
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-end gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  ) : (
                    <>
                      <Button onClick={handleSaveContact} disabled={updateContactMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateContactMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setContactNumber(shop.contact_number || "");
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Coupon Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Scan customer QR tickets to validate and apply discounts. Customer details will be displayed upon successful scan.
              </p>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => setShowScanner(true)}
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan Customer QR Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FoodShopkeeper;
