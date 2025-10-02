import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Shield, ArrowLeft, Clock, X, Package } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ResaleCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const existingScript = document.getElementById('razorpay-script');
        
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'razorpay-script';
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            setRazorpayLoaded(true);
            resolve(true);
          };
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        } else {
          setRazorpayLoaded(true);
          resolve(true);
        }
      });
    };

    loadRazorpayScript();
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('resale_listings')
        .select(`
          *,
          seller:seller_id (
            id,
            full_name,
            email,
            rating_avg
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.status !== 'active') {
        toast({
          title: "Item Not Available",
          description: "This listing is no longer available for purchase.",
          variant: "destructive"
        });
        navigate('/resale');
        return;
      }

      setListing(data);
      setSeller(data.seller);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive"
      });
      navigate('/resale');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment system loading...",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete purchase",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Calculate amounts (10% platform fee)
      const itemAmount = listing.price;
      const platformFee = Math.round(itemAmount * 0.1);
      const sellerAmount = itemAmount - platformFee;

      // Create escrow transaction
      const { data: transaction, error: txError } = await supabase
        .from('resale_transactions')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount: itemAmount,
          platform_fee: platformFee,
          seller_amount: sellerAmount,
          status: 'escrow'
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create Razorpay order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-resale-order', {
        body: {
          amount: itemAmount * 100, // Convert to paise
          transactionId: transaction.id,
          listingId: listing.id,
          buyerId: user.id,
          sellerId: listing.seller_id
        }
      });

      if (orderError) throw orderError;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: "KIIT Saathi - Resale",
        description: `Purchase: ${listing.title}`,
        image: "/favicon.ico",
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-resale-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: transaction.id
              }
            });

            if (verifyError) throw verifyError;

            if (verifyData.success) {
              toast({
                title: "Payment Successful! 🎉",
                description: "Funds are in escrow. Seller will be notified.",
                duration: 5000,
              });
              navigate(`/resale/transactions`);
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "",
          email: user.email || "",
          contact: ""
        },
        notes: {
          listing_id: listing.id,
          transaction_id: transaction.id,
          service: "resale_purchase"
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Failed",
        description: "Could not initialize payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <Clock className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const platformFee = Math.round(listing.price * 0.1);
  const sellerAmount = listing.price - platformFee;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/resale/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listing
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Secure Checkout with Escrow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Information */}
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
              <p className="text-sm text-muted-foreground">
                Sold by: <span className="font-medium">{seller?.full_name}</span>
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">{seller?.rating_avg || 5.0}</span>
              </div>
            </div>

            <Separator />

            {/* Payment Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Payment Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Item Price
                  </span>
                  <span className="font-medium">₹{listing.price}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Platform Fee (10%)
                  </span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Seller Receives</span>
                  <span>₹{sellerAmount}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-lg text-primary">₹{listing.price}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Escrow Features */}
            <div className="space-y-3">
              <h4 className="font-semibold">Buyer Protection with Escrow:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Funds held safely until delivery confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Secure & encrypted transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Full refund if item not as described</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Chat with seller in-app</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="space-y-3">
              <Button 
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{listing.price} (Escrow Protected)
                  </div>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate(`/resale/${id}`)}
                className="w-full"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-xs text-muted-foreground text-center bg-muted p-3 rounded-lg">
              <Shield className="w-4 h-4 mx-auto mb-1" />
              Secure payment powered by Razorpay. Funds released only after delivery confirmation.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}