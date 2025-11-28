import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRScanner from "@/components/food/QRScanner";

const FoodAdminRedemption = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Admin access required</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({ title: "Please enter a coupon code", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-coupon', {
        body: {
          code: code.trim(),
          staff_id: user.id,
          location: location.trim() || null,
          notes: notes.trim() || null
        }
      });

      if (error) throw error;

      if (data.success) {
        setRedeemed(true);
        toast({
          title: "Coupon Redeemed!",
          description: `${data.coupon.shop_name} - ₹${data.coupon.discount_value} discount applied`,
        });
        setCode("");
        setLocation("");
        setNotes("");
      } else {
        throw new Error(data.error || 'Redemption failed');
      }
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (scannedCode: string) => {
    setCode(scannedCode);
    setShowScanner(false);
    toast({ title: "QR Code Scanned", description: scannedCode });
  };

  if (redeemed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Redeemed Successfully!</h2>
            <p className="text-muted-foreground mb-6">The coupon has been marked as used.</p>
            <Button onClick={() => setRedeemed(false)} className="w-full">
              Redeem Another
            </Button>
            <Button variant="outline" onClick={() => navigate('/food/admin')} className="w-full mt-2">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="outline"
            size="icon"
            className="mb-6"
            onClick={() => setShowScanner(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate('/food/admin')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-6">Redeem Coupon</h1>

            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter or scan coupon code"
                  className="text-lg"
                />
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowScanner(true)}
              >
                Scan QR Code
              </Button>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Campus 3, Main Counter"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleRedeem} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Processing..." : "Redeem Coupon"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodAdminRedemption;