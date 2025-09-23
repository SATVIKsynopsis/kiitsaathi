import React, { useState } from 'react';
import PaymentComponent from '@/components/PaymentComponent';
import { TermsAndConditions } from '@/components/TermsAndConditions';
import { usePolicyManager } from '@/hooks/usePolicyManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ExternalLink, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentWithTermsProps {
  amount: number;
  user_id: string;
  service_name: string;
  subservice_name?: string;
  payment_method: string;
  autoOpen?: boolean;
  onSuccess?: () => void;
}

export function PaymentWithTerms({ 
  amount, 
  user_id, 
  service_name, 
  subservice_name, 
  payment_method, 
  autoOpen = false,
  onSuccess 
}: PaymentWithTermsProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [proceedToPayment, setProceedToPayment] = useState(false);
  const { requireTermsAcceptance, acceptTermsAndConditions } = usePolicyManager();

  const handlePaymentAttempt = () => {
    const termsAccepted = requireTermsAcceptance(service_name);
    
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }
    
    setProceedToPayment(true);
  };

  const handleTermsAccept = async () => {
    const accepted = await acceptTermsAndConditions();
    if (accepted) {
      setShowTerms(false);
      setProceedToPayment(true);
    }
  };

  if (proceedToPayment) {
    return (
      <PaymentComponent
        amount={amount}
        user_id={user_id}
        service_name={service_name}
        subservice_name={subservice_name}
        payment_method={payment_method}
        autoOpen={autoOpen}
      />
    );
  }

  return (
    <>
      <Card className="glass-card max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-gradient flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ₹{amount}
            </Badge>
            <p className="text-muted-foreground">
              {service_name} {subservice_name && `- ${subservice_name}`}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
                <p className="font-medium">Before proceeding with payment:</p>
                <p>You must agree to our Terms & Conditions and understand our refund policy.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePaymentAttempt}
              className="w-full gradient-primary text-white"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Powered by Razorpay • Secure Payments
              </p>
              <div className="flex justify-center gap-4 text-xs">
                <Link 
                  to="/terms-and-conditions" 
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Terms & Conditions <ExternalLink className="w-3 h-3" />
                </Link>
                <Link 
                  to="/privacy-policy" 
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Privacy Policy <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                <Link 
                  to="https://razorpay.com/refund-policy/" 
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Refund Policy by Razorpay
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions Modal */}
      <TermsAndConditions
        open={showTerms}
        onOpenChange={setShowTerms}
        onAccept={handleTermsAccept}
        serviceName={service_name}
      />
    </>
  );
}