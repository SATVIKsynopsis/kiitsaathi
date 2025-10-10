import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  CreditCard,
  IndianRupee,
  Shield,
  Clock,
  X,
  Loader2,
  Zap,
} from "lucide-react";

// ---------------- Custom Animations ----------------
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

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// ---------------- Component Props ----------------
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

// ---------------- Component ----------------
const LostFoundPaymentComponent: React.FC<LostFoundPaymentComponentProps> = ({
  itemId,
  itemTitle,
  itemPosterName,
  itemPosterEmail,
  payerUserId,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isInitializingBackend, setIsInitializingBackend] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing payment...");

  // ---------------- Load Razorpay Script ----------------
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const existingScript = document.getElementById("razorpay-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "razorpay-script";
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
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

  // ---------------- Payment Logic ----------------
  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment System Loading",
        description:
          "Please wait a moment while we initialize the payment system...",
      });
      return;
    }

    setIsProcessing(true);
    setIsInitializingBackend(true);
    setLoadingMessage("Waking up our servers...");

    try {
      const messageTimer = setTimeout(() => {
        setLoadingMessage("Starting backend services...");
        setTimeout(() => {
          setLoadingMessage("Almost ready! Preparing payment...");
        }, 3000);
      }, 2000);

      // Create Order
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_URL}/create-lost-found-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 500, // ₹5 in paise
            itemId,
            itemTitle,
            itemPosterEmail,
            payerUserId,
            receipt: `lf_${itemId.slice(-6)}_${Date.now().toString().slice(-8)}`,
          }),
        }
      );

      clearTimeout(messageTimer);
      setIsInitializingBackend(false);

      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "KIIT Saathi - Lost & Found",
        description: `Unlock contact details for: ${itemTitle}`,
        image: "/favicon.ico",
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_API_URL}/verify-lost-found-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  itemId,
                  itemTitle,
                  itemPosterEmail,
                  payerUserId,
                  splitDetails: {
                    totalAmount: 5,
                    platformFee: 5,
                    posterAmount: 0,
                  },
                }),
              }
            );

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              toast({
                title: "Payment Successful! 🎉",
                description: "Contact details have been sent to your email.",
                duration: 5000,
              });
              onPaymentSuccess();
            } else {
              throw new Error(
                verifyResult.message || "Payment verification failed"
              );
            }
          } catch {
            toast({
              title: "Payment Verification Failed",
              description:
                "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          }
        },
        prefill: { name: "", email: "", contact: "" },
        notes: {
          item_id: itemId,
          item_title: itemTitle,
          service: "lost_found_contact",
        },
        theme: { color: "#3399cc" },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      setIsInitializingBackend(false);
      toast({
        title: "Payment Failed",
        description:
          "Could not initialize payment. Please try again in a moment.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border border-border/30 overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 animate-fadeIn">
        <CardHeader className="text-center pb-3 border-b border-border/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            🔓 Unlock Contact Details
          </CardTitle>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm">
            <span className="font-semibold">{itemTitle}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Posted by: {itemPosterName}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Payment Breakdown */}
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
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-blue-600">₹5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-5 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 text-center flex items-center justify-center gap-2">
                ✨ What you get
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  "Complete contact details (Email & Phone)",
                  "Instant access after payment",
                  "One-time payment (no recurring charges)",
                  "Help reunite lost items with owners",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-between">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isInitializingBackend ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingMessage}</span>
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
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
                className="w-full h-10 mt-3"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LostFoundPaymentComponent;
