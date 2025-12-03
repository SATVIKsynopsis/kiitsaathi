import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Ticket, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';

const FoodGenerateCoupon = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };
  const [generating, setGenerating] = useState(false);

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/shop/${shopId}/batches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch shop');
      const data = await response.json();
      return data.shop;
    },
  });

  const generateCouponMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in");
      
      const response = await fetch(`${HOSTED_URL}/api/food/generate-coupon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          shopId,
          couponData: {
            amount: batch?.amount_per_coupon || 0,
            items: ['Discount Coupon'],
            paymentMethod: 'coupon'
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate coupon');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Coupon generated successfully!");
      navigate(`/food/ticket/${data.coupon.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate coupon");
    },
  });

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in to generate coupons");
      navigate('/auth');
      return;
    }
    setGenerating(true);
    await generateCouponMutation.mutateAsync();
    setGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-2xl">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!shop || !shop.coupon_batches || shop.coupon_batches.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">
              No active coupon batches for this shop
            </p>
            <Button onClick={() => navigate('/food')}>Back to Shops</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const batch = shop.coupon_batches[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate(`/food/shop/${shopId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Ticket className="h-8 w-8" />
              Generate Coupon
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Shop Info */}
            <div className="text-center">
              {shop.photos && shop.photos[0] && (
                <img
                  src={shop.photos[0]}
                  alt={shop.name}
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-primary"
                />
              )}
              <h2 className="text-2xl font-bold text-foreground">{shop.name}</h2>
              <p className="text-muted-foreground">{shop.short_desc}</p>
            </div>

            {/* Coupon Details */}
            <Card className="bg-muted/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Discount Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{batch.amount_per_coupon}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valid For</span>
                  <span className="font-semibold">{batch.expires_in_days} days</span>
                </div>

                {batch.per_user_limit && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Per User Limit</span>
                    <span className="font-semibold">{batch.per_user_limit} coupons</span>
                  </div>
                )}

                {batch.start_time && batch.end_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Valid Hours</span>
                    <span className="font-semibold">
                      {batch.start_time} - {batch.end_time}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Coupon is valid for single use only</li>
                  <li>Show this coupon at the counter when ordering</li>
                  <li>Cannot be combined with other offers</li>
                  <li>Expires after {batch.expires_in_days} days from generation</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={generating || generateCouponMutation.isPending}
            >
              {generating || generateCouponMutation.isPending ? (
                <>Generating...</>
              ) : (
                <>
                  <Ticket className="h-5 w-5 mr-2" />
                  Generate My Coupon
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodGenerateCoupon;