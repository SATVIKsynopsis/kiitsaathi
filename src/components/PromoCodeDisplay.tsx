import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCodeDisplayProps {
  promoCode: string;
  orderDetails: {
    celebrationType: string;
    dateTime: string;
    venueLocation: string;
    specialRequests?: string;
  };
}

export function PromoCodeDisplay({ promoCode, orderDetails }: PromoCodeDisplayProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(promoCode);
    toast.success('Promo code copied to clipboard!');
  };

  return (
    <Card className="glass-card border-2 border-celebration-primary/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-celebration-primary">
          <CheckCircle className="w-6 h-6" />
          Booking Confirmed!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Your Promo Code</h3>
          <div className="bg-celebration-primary/10 border-2 border-celebration-primary/30 rounded-lg p-4">
            <div className="text-2xl font-mono font-bold text-celebration-primary mb-2">
              {promoCode}
            </div>
            <Button 
              onClick={copyToClipboard}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-center">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Celebration Type:</span>
              <span className="font-medium">{orderDetails.celebrationType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time:</span>
              <span className="font-medium">
                {new Date(orderDetails.dateTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue:</span>
              <span className="font-medium">{orderDetails.venueLocation}</span>
            </div>
            {orderDetails.specialRequests && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Special Requests:</span>
                <span className="font-medium">{orderDetails.specialRequests}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Next Steps:</strong> Share this promo code with your chosen bakery. 
            They can use it to access your order details and prepare your celebration package.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}