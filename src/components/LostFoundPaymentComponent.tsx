import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Shield, Users, Clock, X, Loader2, Zap } from "lucide-react";



const styles = `
  @keyframes loading {
    0% { width: 0%; }
    50% { width: 75%; }
    100% { width: 100%; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .dark .shimmer {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200px 100%;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

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
  const [isInitializingBackend, setIsInitializingBackend] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing payment...");

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
        title: "Payment System Loading",
        description: "Please wait a moment while we initialize the payment system...",
        variant: "default"
      });
      return;
    }

    setIsProcessing(true);
    setIsInitializingBackend(true);
    setLoadingMessage("Waking up our servers...");

    try {
      // Add a timeout to show different messages for slow backend
      const messageTimer = setTimeout(() => {
        setLoadingMessage("Starting backend services...");
        setTimeout(() => {
          setLoadingMessage("Almost ready! Preparing payment...");
        }, 3000);
      }, 2000);

      // Create order with payment splitting information
      const orderRes = await fetch(`http://localhost:8080/create-lost-found-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 500, // 5 rupees in paise
          itemId,
          itemTitle,
          itemPosterEmail,
          payerUserId,
          receipt: `lf_${itemId.slice(-6)}_${Date.now().toString().slice(-8)}` // Max 40 chars: lf_ + 6 + _ + 8 = 18 chars
        }),
      });

      clearTimeout(messageTimer);
      setIsInitializingBackend(false);

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
            const verifyRes = await fetch(`http://localhost:8080/verify-lost-found-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                itemId,
                itemTitle,
                itemPosterEmail,
                payerUserId
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
      setIsInitializingBackend(false);
      toast({
        title: "Payment Failed",
        description: "Could not initialize payment. Our servers might be starting up - please try again in a moment.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl">
          <Shield className="w-8 h-8" />
          Unlock Contact Details
        </CardTitle>
        <p className="text-blue-100 text-base mt-2">Secure payment to connect with the poster</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Item Info & Payment Details */}
          <div className="space-y-6">
            {/* Item Information */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-xl mb-3 text-blue-900 dark:text-blue-100">{itemTitle}</h3>
              <p className="text-blue-700 dark:text-blue-300">
                Posted by: <span className="font-semibold text-lg">{itemPosterName}</span>
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="font-bold flex items-center gap-3 text-green-800 dark:text-green-200 text-lg mb-4">
                <IndianRupee className="w-6 h-6" />
                Payment Breakdown
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <span className="flex items-center gap-3 text-base">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Platform Service Fee
                  </span>
                  <span className="font-bold text-blue-600 text-lg">₹5</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-xl p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                  <span>Total Amount</span>
                  <span className="text-3xl text-blue-600 dark:text-blue-400">₹5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features & Payment Button */}
          <div className="space-y-6">
            {/* Features */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <h4 className="font-bold text-purple-800 dark:text-purple-200 text-lg mb-4">What you get:</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-base">Complete contact details (Email & Phone)</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-base">Instant access after payment</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-base">Secure & encrypted transaction</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-base">Support platform development</span>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                size="lg"
              >
                {isInitializingBackend ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="animate-pulse">{loadingMessage}</span>
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 animate-bounce" />
                    Opening Payment Gateway...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    Pay ₹5 & Get Contact Details
                  </div>
                )}
              </Button>


              

              <Button 
                variant="outline" 
                onClick={onPaymentCancel}
                className="w-full h-12 text-base"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-300">100% Secure Payment</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Powered by Razorpay with bank-level security. Your payment supports the platform and helps maintain the Lost & Found service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Loading Animation */}
        {isInitializingBackend && (
          <div className="col-span-1 lg:col-span-2 mt-6">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <div className="absolute inset-0 w-6 h-6 border-2 border-blue-200 rounded-full animate-ping"></div>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Waking up our servers...
                </span>
              </div>
              
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                Our backend is hosted on a free plan and needs a moment to start up. This process usually takes 30-60 seconds. 
                <span className="font-semibold text-blue-800 dark:text-blue-200"> Thank you for your patience! 🚀</span>
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <span>{loadingMessage}</span>
                  <span className="animate-pulse">⚡</span>
                </div>
                
                <div className="relative bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full animate-[loading_3s_ease-in-out_infinite] w-3/4"></div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LostFoundPaymentComponent;