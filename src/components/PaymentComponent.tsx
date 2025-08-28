import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentComponentProps {
  amount: number;
  user_id: string;
  service_name: string;
  subservice_name?: string;
  payment_method: string;
  autoOpen?: boolean;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ amount, user_id, service_name, subservice_name, payment_method, autoOpen = false }) => {
  const navigate = useNavigate();
  const handlePay = async () => {
    console.log('Pay Now button clicked');
    // 1. Create order
  console.log('Creating Razorpay order...');
  const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt: `rcpt_${Date.now()}` }),
    });
  const order = await orderRes.json();
  console.log('Order response:', order);

  // Use actual values from props

    // 2. Open Razorpay Checkout
    const options = {
      // Debug log for Razorpay key
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          console.log('Razorpay response:', response);
          const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              user_id,
              amount,
              service_name,
              subservice_name,
              payment_method,
            }),
          });
          const verify = await verifyRes.json();
          console.log('Verify payment response:', verify);
          if (verify.success) {
            // Show payment success popup
            const popup = document.createElement('div');
            popup.innerHTML = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:9999;"><div style="background:white;padding:2rem 3rem;border-radius:1rem;box-shadow:0 2px 16px #0002;text-align:center;"><h2 style="color:#2563eb;font-size:2rem;margin-bottom:1rem;">Payment Successful!</h2><p style="color:#16a34a;font-size:1.2rem;">Thank you for your purchase.</p></div></div>`;
            document.body.appendChild(popup);
            setTimeout(() => {
              document.body.removeChild(popup);
              navigate('/orders');
            }, 1800);
          } else {
            alert('Payment Verification Failed!');
            console.error('Payment verification failed:', verify);
          }
        } catch (err) {
          alert('Payment Verification Error!');
          console.error('Error in payment verification:', err);
        }
      },
      theme: { color: '#3399cc' },
    };
  const rzp = new (window as any).Razorpay(options);
  console.log('Opening Razorpay window...');
  rzp.open();
  };

  useEffect(() => {
    if (autoOpen) {
      handlePay();
    }
  }, [autoOpen]);

  return !autoOpen ? <button onClick={handlePay}>Pay Now</button> : null;
};

export default PaymentComponent;
