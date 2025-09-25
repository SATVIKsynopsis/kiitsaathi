import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Shield, Users, Clock, X } from "lucide-react";

interface LostFoundPaymentComponentProps {
  itemId: string;
  itemTitle: string;
  itemPosterName: string;
  itemPosterEmail: string;
  payerUserId: string;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const LostFoundPaymentComponent: React.FC<LostFoundPaymentComponentProps> = ({ 
  itemId, 
  itemTitle, 
  itemPosterName,
  itemPosterEmail,
  payerUserId, 
  onPaymentSuccess, 
  onPaymentCancel 
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
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
  }, []);

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
      // Create order with payment splitting information
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/create-lost-found-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 1500, // 15 rupees in paise
          itemId,
          itemTitle,
          itemPosterEmail,
          payerUserId,
          receipt: `lf_${itemId.slice(-6)}_${Date.now().toString().slice(-8)}` // Max 40 chars: lf_ + 6 + _ + 8 = 18 chars
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderRes.json();
      console.log('Lost & Found order created:', order);

      // Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "KIIT Saathi - Lost & Found",
        description: `Unlock contact details for: ${itemTitle}`,
        image: "/favicon.ico", // Your app logo
        handler: async (response: any) => {
          try {
            console.log('Razorpay payment response:', response);
            
            // Verify payment and process split
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/verify-lost-found-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                itemId,
                itemTitle,
                itemPosterEmail,
                payerUserId,
                splitDetails: {
                  totalAmount: 15,
                  platformFee: 5,
                  posterAmount: 10
                }
              }),
            });

            const verifyResult = await verifyRes.json();
            console.log('Payment verification result:', verifyResult);

            if (verifyResult.success) {
              toast({
                title: "Payment Successful! 🎉",
                description: "Contact details have been sent to your email.",
                duration: 5000,
              });
              onPaymentSuccess();
            } else {
              throw new Error(verifyResult.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          item_id: itemId,
          item_title: itemTitle,
          service: "lost_found_contact"
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Unlock Contact Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Item Information */}
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">{itemTitle}</h3>
          <p className="text-sm text-muted-foreground">
            Posted by: <span className="font-medium">{itemPosterName}</span>
          </p>
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
                <Users className="w-4 h-4 text-green-600" />
                Item Poster Reward
              </span>
              <span className="font-medium">₹10</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Platform Service Fee
              </span>
              <span className="font-medium">₹5</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-lg">₹15</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold">What you get:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Complete contact details (Email & Phone)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Instant access after payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Secure & encrypted transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Support helpful community members</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            disabled={isProcessing || !razorpayLoaded}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
                Pay ₹15 & Get Contact Details
              </div>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={onPaymentCancel}
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
          Secure payment powered by Razorpay. Your money helps reward those who help others.
        </div>
      </CardContent>
    </Card>
  );
};

export default LostFoundPaymentComponent;