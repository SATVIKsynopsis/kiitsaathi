import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Home, Package, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { format } from 'date-fns';

interface PaymentSuccessProps {
  orderData: {
    service_name: string;
    subservice_name?: string | null;
    amount: number;
    payment_status?: string;
    transaction_id?: string | null;
    payment_method?: string | null;
    booking_details?: any;
  };
  onContinue?: () => void;
  showBackButton?: boolean;
  customSuccessMessage?: string;
  customConfirmationMessage?: string;
}

export function PaymentSuccess({ 
  orderData, 
  onContinue, 
  showBackButton = true,
  customSuccessMessage,
  customConfirmationMessage 
}: PaymentSuccessProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrder } = useOrderHistory();
  const [isRecording, setIsRecording] = useState(false);
  const [orderRecorded, setOrderRecorded] = useState(false);

  useEffect(() => {
    const recordOrder = async () => {
      if (!user || orderRecorded || isRecording) return;
      
      setIsRecording(true);
      try {
        await createOrder({
          service_name: orderData.service_name,
          subservice_name: orderData.subservice_name || null,
          amount: orderData.amount,
          payment_status: orderData.payment_status || 'completed',
          transaction_id: orderData.transaction_id || null,
          payment_method: orderData.payment_method || null,
          booking_details: orderData.booking_details || null
        });
        setOrderRecorded(true);
      } catch (error) {
        console.error('Failed to record order:', error);
      } finally {
        setIsRecording(false);
      }
    };

    recordOrder();
  }, [user, orderData, createOrder, orderRecorded, isRecording]);

  const getServiceIcon = (serviceName: string) => {
    const service = serviceName.toLowerCase();
    if (service.includes('print')) return '🖨️';
    if (service.includes('book')) return '📚';
    if (service.includes('tour')) return '🏛️';
    if (service.includes('carton')) return '📦';
    if (service.includes('celebration')) return '🎉';
    if (service.includes('skill')) return '🎯';
    if (service.includes('sports')) return '⚽';
    if (service.includes('fest')) return '🎪';
    return '✨';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {customSuccessMessage || "Payment Complete!"}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Package className="w-5 h-5 text-kiit-green" />
            <span className="text-lg font-semibold text-kiit-green">
              {customConfirmationMessage || "Booking Confirmed"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getServiceIcon(orderData.service_name)}</span>
                <div>
                  <p className="font-semibold">{orderData.service_name}</p>
                  {orderData.subservice_name && (
                    <p className="text-sm text-muted-foreground">{orderData.subservice_name}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-kiit-green">₹{orderData.amount}</p>
                {orderData.payment_method && (
                  <p className="text-sm text-muted-foreground capitalize">{orderData.payment_method}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Transaction Date</span>
                </div>
                <span>{format(new Date(), 'PPp')}</span>
              </div>

              {orderData.transaction_id && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span>Transaction ID</span>
                  </div>
                  <span className="font-mono text-xs">{orderData.transaction_id}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span>Status</span>
                <Badge className="bg-green-100 text-green-800">
                  ✅ {orderData.payment_status || 'Completed'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {orderData.booking_details && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-2">📋 Booking Details</p>
              <p className="text-sm text-muted-foreground">
                {typeof orderData.booking_details === 'string' 
                  ? orderData.booking_details 
                  : JSON.stringify(orderData.booking_details, null, 2)
                }
              </p>
            </div>
          )}

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-kiit-green border-t-transparent rounded-full animate-spin" />
              Recording transaction...
            </div>
          )}

          {/* Success Message */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              🎉 We'll contact you within 24 hours to confirm details and coordinate next steps.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => navigate('/order-history')}
              className="w-full"
              variant="default"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              View Order History
            </Button>
            
            {onContinue ? (
              <Button onClick={onContinue} variant="outline" className="w-full">
                Continue
              </Button>
            ) : showBackButton && (
              <Button 
                onClick={() => navigate('/')}
                variant="outline" 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}