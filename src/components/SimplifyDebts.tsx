import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, ArrowRight, CheckCircle, Info } from "lucide-react";

interface SimplifiedDebt {
  from_member_id: string;
  from_member_name: string;
  to_member_id: string;
  to_member_name: string;
  amount: number;
}

interface SimplifyDebtsProps {
  groupId: string;
  currency: string;
}

export const SimplifyDebts = ({ groupId, currency }: SimplifyDebtsProps) => {
  const [debts, setDebts] = useState<SimplifiedDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSimplifiedDebts();
  }, [groupId]);

  const loadSimplifiedDebts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('simplify_group_debts', {
        _group_id: groupId
      });

      if (error) throw error;
      setDebts(data || []);
    } catch (error: any) {
      toast({
        title: "Error simplifying debts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => `${currency}${amount.toFixed(2)}`;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simplified Debts
          </CardTitle>
          <CardDescription>Minimized transactions for easy settlement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Simplified Debts
        </CardTitle>
        <CardDescription>Minimized transactions for easy settlement</CardDescription>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Great! All debts are settled or there are no expenses to settle yet.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Instead of complex multiple payments, use these {debts.length} simplified transaction{debts.length !== 1 ? 's' : ''} to settle all group debts.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {debts.map((debt, index) => (
                <div 
                  key={`${debt.from_member_id}-${debt.to_member_id}`}
                  className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold text-green-800">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="font-semibold text-gray-900">
                          {debt.from_member_name}
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="text-sm font-medium">pays</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-gray-900">
                          {debt.to_member_name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-xl text-green-700">
                        {formatAmount(debt.amount)}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Settlement amount
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600 bg-white/50 rounded p-2">
                    💰 <strong>{debt.from_member_name}</strong> should transfer <strong>{formatAmount(debt.amount)}</strong> to <strong>{debt.to_member_name}</strong>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Settlement Instructions:
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Each person makes their payment exactly as shown above</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Use any payment method: UPI, bank transfer, cash, etc.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <span>After these {debts.length} payment{debts.length !== 1 ? 's' : ''}, everyone will be completely settled!</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-white/60 rounded text-xs text-green-600">
                💡 <strong>Share this screen</strong> with your group so everyone knows exactly what to pay!
              </div>
            </div>
          </>
        )}
        
        <Button 
          variant="outline" 
          onClick={loadSimplifiedDebts} 
          className="w-full mt-4"
        >
          Recalculate Debts
        </Button>
      </CardContent>
    </Card>
  );
};