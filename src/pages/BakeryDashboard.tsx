import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Search, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  name: string;
  celebrationType: string;
  dateTime: string;
  venueLocation: string;
  contactNumber: string;
  specialRequests?: string;
  promoCode: string;
  status: string;
}

export default function BakeryDashboard() {
  const [promoCode, setPromoCode] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchOrder = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('celebration_bookings')
        .select('*')
        .eq('promo_code', promoCode.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Invalid promo code. Please check and try again.');
        } else {
          toast.error('Error fetching order details');
        }
        setOrderDetails(null);
        return;
      }

      if (data.bakery_fulfilled) {
        toast.warning('This order has already been fulfilled');
      }

      setOrderDetails({
        id: data.id,
        name: data.name,
        celebrationType: data.celebration_type,
        dateTime: data.date_time,
        venueLocation: data.venue_location,
        contactNumber: data.contact_number,
        specialRequests: data.special_requests,
        promoCode: data.promo_code,
        status: data.status
      });

      toast.success('Order details loaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch order details');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsFulfilled = async () => {
    if (!orderDetails) return;

    try {
      const { error } = await supabase
        .from('celebration_bookings')
        .update({ bakery_fulfilled: true })
        .eq('id', orderDetails.id);

      if (error) {
        toast.error('Failed to mark order as fulfilled');
        return;
      }

      toast.success('Order marked as fulfilled successfully!');
      setOrderDetails({ ...orderDetails, status: 'fulfilled' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark order as fulfilled');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-poppins font-bold text-gradient mb-4 flex items-center justify-center gap-2">
            <Store className="w-8 h-8" />
            Bakery Partner Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter the promo code to access customer order details
          </p>
        </div>

        {/* Search Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Enter promo code (e.g., KSCEL-92AFD7GQ1X)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={searchOrder} 
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderDetails && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Order Details
                </CardTitle>
                <Badge 
                  variant={orderDetails.status === 'confirmed' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {orderDetails.status === 'confirmed' ? 'Active' : 'Fulfilled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Customer Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-celebration-primary rounded-full"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Name</p>
                        <p className="font-medium">{orderDetails.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Number</p>
                        <p className="font-medium">{orderDetails.contactNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Venue Location</p>
                        <p className="font-medium">{orderDetails.venueLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Celebration Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-celebration-secondary rounded-full"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Celebration Type</p>
                        <p className="font-medium">{orderDetails.celebrationType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p className="font-medium">
                          {new Date(orderDetails.dateTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Promo Code</p>
                        <p className="font-mono font-medium bg-muted px-2 py-1 rounded">
                          {orderDetails.promoCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {orderDetails.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Special Requests</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">{orderDetails.specialRequests}</p>
                    </div>
                  </div>
                </>
              )}

              {orderDetails.status === 'confirmed' && (
                <>
                  <Separator />
                  <div className="flex justify-center">
                    <Button 
                      onClick={markAsFulfilled}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Fulfilled
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions or issues with orders, please contact KIIT Saathi support.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@kiitsaathi.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 XXX-XXX-XXXX</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}