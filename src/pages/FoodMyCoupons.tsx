import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Ticket, Check, Clock, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const FoodMyCoupons = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };

  const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';


  const { data: coupons, isLoading } = useQuery({
    queryKey: ['my-coupons', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await fetch(`${HOSTED_URL}/api/food/my-coupons`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      
      const data = await response.json();
      return data.coupons || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-xl text-muted-foreground mb-4">Please sign in to view your coupons</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCoupons = coupons?.filter(c => c.status === 'generated' && new Date(c.expires_at) > new Date()) || [];
  const redeemedCoupons = coupons?.filter(c => c.status === 'redeemed') || [];
  const expiredCoupons = coupons?.filter(c => c.status === 'expired' || (c.status === 'generated' && new Date(c.expires_at) <= new Date())) || [];

  const CouponCard = ({ coupon }: any) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/food/ticket/${coupon.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{coupon.shops.name}</h3>
            <p className="text-2xl font-bold text-primary">₹{coupon.discount_value}</p>
          </div>
          <Badge variant={coupon.status === 'generated' ? 'default' : coupon.status === 'redeemed' ? 'secondary' : 'destructive'}>
            {coupon.status === 'generated' && <Clock className="h-3 w-3 mr-1" />}
            {coupon.status === 'redeemed' && <Check className="h-3 w-3 mr-1" />}
            {coupon.status === 'expired' && <X className="h-3 w-3 mr-1" />}
            {coupon.status}
          </Badge>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Code: <span className="font-mono font-semibold">{coupon.code}</span></p>
          <p>
            {coupon.status === 'redeemed' 
              ? `Redeemed: ${new Date(coupon.redeemed_at).toLocaleDateString()}`
              : `Expires: ${new Date(coupon.expires_at).toLocaleDateString()}`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            size="icon"
            className="mb-6"
            onClick={() => navigate('/food')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Ticket className="h-10 w-10" />
            My Coupons
          </h1>
          <p className="text-muted-foreground">Manage your food coupons</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active">
              Active ({activeCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="redeemed">
              Redeemed ({redeemedCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredCoupons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : activeCoupons.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No active coupons</p>
                  <Button onClick={() => navigate('/food')}>Browse Shops</Button>
                </CardContent>
              </Card>
            ) : (
              activeCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)
            )}
          </TabsContent>

          <TabsContent value="redeemed" className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : redeemedCoupons.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No redeemed coupons yet</p>
                </CardContent>
              </Card>
            ) : (
              redeemedCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : expiredCoupons.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No expired coupons</p>
                </CardContent>
              </Card>
            ) : (
              expiredCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FoodMyCoupons;