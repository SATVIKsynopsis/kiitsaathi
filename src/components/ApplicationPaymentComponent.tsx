import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Check, CreditCard, IndianRupee, Shield, Clock, X } from "lucide-react";

interface ApplicationPaymentComponentProps {
  applicationId: string;
  lostItemTitle: string;
  applicantName: string;
  ownerUserId: string;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const ApplicationPaymentComponent: React.FC<ApplicationPaymentComponentProps> = ({
  applicationId,
  lostItemTitle,
  applicantName,
  ownerUserId,
  onPaymentSuccess,
  onPaymentCancel
}) => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  console.log('🎨 ApplicationPaymentComponent rendered', {
    isProcessing,
    razorpayLoaded,
    applicationId,
    lostItemTitle,
    applicantName
  });

  // Load Razorpay script
  useEffect(() => {
    console.log('🔧 Razorpay script loading effect triggered');
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const existingScript = document.getElementById('razorpay-script');
        if (!existingScript) {
          console.log('📥 Loading Razorpay script...');
          const script = document.createElement('script');
          script.id = 'razorpay-script';
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            console.log('✅ Razorpay script loaded successfully');
            setRazorpayLoaded(true);
            resolve(true);
          };
          script.onerror = () => {
            console.error('❌ Failed to load Razorpay script');
            resolve(false);
          };
          document.body.appendChild(script);
        } else {
          console.log('✅ Razorpay script already exists');
          setRazorpayLoaded(true);
          resolve(true);
        }
      });
    };
    loadRazorpayScript();
  }, []);

  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);

  const handlePayment = async () => {
    console.log('💰 handlePayment called');
    console.log('Razorpay loaded:', razorpayLoaded);
    console.log('Is processing:', isProcessing);
    
    if (!razorpayLoaded) {
      console.warn('⚠️ Razorpay not loaded yet');
      toast({
        title: "Payment system loading...",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🔵 Creating payment order...');
      console.log('API URL:', import.meta.env.VITE_HOSTED_URL);
      console.log('Access Token:', accessToken ? 'Present' : 'Missing');
      
      if (!accessToken) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      const orderRes = await fetch(`${import.meta.env.VITE_HOSTED_URL}/api/lostfound/create-application-unlock-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: 500, // ₹5 in paise
          applicationId,
          lostItemTitle,
          ownerUserId,
          receipt: `app_${applicationId.slice(-6)}_${Date.now().toString().slice(-8)}`
        }),
      });

      console.log('Response status:', orderRes.status);
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        console.error('❌ Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const order = await orderRes.json();
      console.log('✅ Order created:', order.id);
      console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "KIIT Saathi - Lost & Found",
        description: `Unlock applicant contact: ${applicantName}`,
        image: "/favicon.ico",
        handler: async (response: any) => {
          console.log('✅ Payment completed:', response.razorpay_payment_id);
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_HOSTED_URL}/api/lostfound/verify-application-unlock-payment`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                applicationId,
                ownerUserId
              }),
            });

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              toast({
                title: "Payment Successful! 🎉",
                description: "Contact details are now visible.",
                duration: 5000,
              });
              onPaymentSuccess();
            } else {
              throw new Error(verifyResult.message || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('❌ Verification error:', err);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: { name: "", email: "", contact: "" },
        notes: {
          application_id: applicationId,
          service: "application_contact_unlock"
        },
        theme: { color: "#3399cc" },
        modal: { 
          ondismiss: () => {
            console.log('⚠️ Payment modal dismissed');
            setRazorpayModalOpen(false);
            setIsProcessing(false);
          },
          escape: true,
          backdropclose: false,
          confirm_close: false
        }
      };

      console.log('🚀 Opening Razorpay checkout...');
      console.log('Window.Razorpay exists:', !!window.Razorpay);
      
      if (!window.Razorpay) {
        throw new Error('Razorpay library not loaded');
      }
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response.error);
        setRazorpayModalOpen(false);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Transaction could not be completed.",
          variant: "destructive"
        });
        setIsProcessing(false);
      });
      
      console.log('📱 Calling razorpay.open()...');
      razorpay.open();
      setRazorpayModalOpen(true);
      console.log('✅ razorpay.open() called successfully');
      
    } catch (error: any) {
      console.error('❌ Payment initialization error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Could not initialize payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const paymentDialog = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ pointerEvents: razorpayModalOpen ? 'none' : 'auto', isolation: 'isolate' }}
      onPointerDown={(e) => {
        if (razorpayModalOpen) return; // Don't block if Razorpay is open
        console.log('👆 PointerDown on backdrop container');
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onPointerUp={(e) => {
        if (razorpayModalOpen) return;
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onMouseDown={(e) => {
        if (razorpayModalOpen) return;
        console.log('🖱️ MouseDown on backdrop container');
        // Stop all mouse events from bubbling
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onMouseUp={(e) => {
        if (razorpayModalOpen) return;
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onClick={(e) => {
        if (razorpayModalOpen) return;
        console.log('🖱️ Click on backdrop area', e.target === e.currentTarget);
        // Only close if clicking the backdrop (not the card)
        if (e.target === e.currentTarget && !isProcessing) {
          console.log('🔴 Backdrop clicked - closing dialog');
          onPaymentCancel();
        } else {
          console.log('🛑 Stopping propagation - not backdrop');
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
    >
      <div
        style={{ 
          pointerEvents: razorpayModalOpen ? 'none' : 'auto', 
          isolation: 'isolate',
          opacity: razorpayModalOpen ? 0 : 1,
          transition: 'opacity 0.2s'
        }}
        onPointerDown={(e) => {
          if (razorpayModalOpen) return;
          console.log('🛡️ Wrapper PointerDown');
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          e.preventDefault();
        }}
        onPointerUp={(e) => {
          if (razorpayModalOpen) return;
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onMouseDown={(e) => {
          if (razorpayModalOpen) return;
          console.log('🛡️ Wrapper MouseDown');
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onMouseUp={(e) => {
          if (razorpayModalOpen) return;
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onClick={(e) => {
          if (razorpayModalOpen) return;
          console.log('🛡️ Wrapper div clicked - stopping all propagation');
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          e.preventDefault();
        }}
      >
        <Card 
          className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border border-border/30 overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 animate-fadeIn relative z-[10000]"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            console.log('🎯 Card clicked - preventing propagation');
            e.stopPropagation();
          }}
        >
          <CardHeader className="text-center pb-3 border-b border-border/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            🔓 Unlock Contact Details
          </CardTitle>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm">
            <span className="font-semibold">{lostItemTitle}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Applicant: {applicantName}</span>
          </div>
        </CardHeader>

        <CardContent 
          className="p-6"
          onClick={(e) => {
            console.log('📦 CardContent clicked - stopping propagation');
            e.stopPropagation();
          }}
        >
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Column 1: Payment Breakdown */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold flex items-center gap-2 mb-3 justify-center">
                <IndianRupee className="w-5 h-5" />
                Payment Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Platform Service Fee
                  </span>
                  <span className="font-bold text-blue-600">₹5</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Secure payment processing</div>
                  <div>• Contact verification</div>
                  <div>• Platform maintenance</div>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-blue-600">₹5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: What You Get + Button */}
            <div className="flex flex-col justify-between">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-5 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 text-center flex items-center justify-center gap-2">
                  ✨ What you get
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    Applicant's name, email & phone number
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    Instant access after payment
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    One-time payment per applicant
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    Arrange item collection directly
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  onPointerDown={(e) => {
                    console.log('💰 PAY BUTTON PointerDown');
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    e.preventDefault();
                  }}
                  onPointerUp={(e) => {
                    console.log('💰 PAY BUTTON PointerUp');
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onMouseDown={(e) => {
                    console.log('💰 PAY BUTTON MouseDown');
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onMouseUp={(e) => {
                    console.log('💰 PAY BUTTON MouseUp');
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onClick={(e) => {
                    console.log('🔵 PAY BUTTON CLICKED!');
                    console.log('Button disabled?', isProcessing || !razorpayLoaded);
                    console.log('isProcessing:', isProcessing);
                    console.log('razorpayLoaded:', razorpayLoaded);
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    
                    // Call handlePayment asynchronously to ensure event is fully stopped
                    setTimeout(() => {
                      handlePayment();
                    }, 0);
                    
                    return false;
                  }}
                  disabled={isProcessing || !razorpayLoaded}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer relative z-10"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay ₹5 & Get Contact Details
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔴 Cancel button clicked');
                    onPaymentCancel();
                  }}
                  className="w-full h-10"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="w-3 h-3" />
              <span className="font-medium">Secure payment powered by Razorpay</span>
            </div>
            <p>Your payment supports platform operations and helps reunite lost items with their owners.</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );

  return createPortal(paymentDialog, document.body);
};

export default ApplicationPaymentComponent;
