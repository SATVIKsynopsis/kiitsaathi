import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QRCode from "react-qr-code";
import { useAuth } from "@/hooks/useAuth";

const FoodTicket = () => {
  const { couponId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;


  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };

  const { data: coupon, isLoading } = useQuery({
    queryKey: ['coupon', couponId],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/coupon/${couponId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupon');
      }
      
      const data = await response.json();
      return data.coupon;
    },
    refetchInterval: 5000, // Refetch every 5 seconds to check status
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-md">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Coupon not found</p>
            <Button onClick={() => navigate('/food')}>Back to Shops</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-blue-500';
      case 'redeemed':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'revoked':
        return 'bg-gray-500';
      case 'flagged':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'redeemed':
        return <Check className="h-5 w-5" />;
      case 'expired':
      case 'revoked':
      case 'flagged':
        return <X className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const isActive = coupon.status === 'generated' && new Date(coupon.expires_at) > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6">
      <div className="container mx-auto max-w-md">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate('/food/my-coupons')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Ticket Card */}
        <Card className={`shadow-2xl relative overflow-hidden ${isActive ? 'border-primary border-2' : ''}`}>
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className={`${getStatusColor(coupon.status)} text-white flex items-center gap-1`}>
              {getStatusIcon(coupon.status)}
              {coupon.status.toUpperCase()}
            </Badge>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Coupon Ticket</h1>
            <p className="text-sm opacity-90">{coupon.shops.name}</p>
          </div>

          <CardContent className="p-8 space-y-6">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-center">
                <QRCode
                  value={coupon.qr_payload || coupon.code}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
            </div>

            {/* Coupon Code */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Coupon Code</p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-3xl font-mono font-bold tracking-wider">{coupon.code}</p>
              </div>
            </div>

            {/* Discount Amount */}
            <div className="text-center py-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Discount Amount</p>
              <p className="text-4xl font-bold text-primary">₹{coupon.discount_value}</p>
            </div>

            {/* Expiry */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {coupon.status === 'redeemed' ? 'Redeemed At' : 'Expires At'}
              </p>
              <p className="font-semibold">
                {new Date(coupon.status === 'redeemed' ? coupon.redeemed_at! : coupon.expires_at).toLocaleString()}
              </p>
            </div>

            {/* Instructions */}
            {isActive && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">How to Use:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Show this screen at {coupon.shops.name}</li>
                  <li>Staff will scan the QR code or enter the code</li>
                  <li>Enjoy your discount of ₹{coupon.discount_value}</li>
                </ol>
              </div>
            )}

            {/* Terms */}
            <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground space-y-1">
              <p>• Single use only</p>
              <p>• Cannot be combined with other offers</p>
              <p>• Non-transferable</p>
              <p>• Must be shown at time of purchase</p>
            </div>

            {/* Action Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/food/shop/${coupon.shop_id}`)}
            >
              View Shop Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodTicket;