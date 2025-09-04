import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";

interface Balance {
  member_id: string;
  member_name: string;
  member_email: string;
  total_paid: number;
  total_share: number;
  net_balance: number;
}

interface ViewBalancesProps {
  groupId: string;
  currency: string;
}

export const ViewBalances = ({ groupId, currency }: ViewBalancesProps) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBalances();
  }, [groupId]);

  const loadBalances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('calculate_group_balances', {
        _group_id: groupId
      });

      if (error) throw error;
      setBalances(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading balances",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => `${currency}${Math.abs(amount).toFixed(2)}`;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Group Balances
          </CardTitle>
          <CardDescription>Who owes what in this group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (balances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Group Balances
          </CardTitle>
          <CardDescription>Who owes what in this group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No balances yet</h3>
            <p className="text-muted-foreground">Add some expenses to see who owes what</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOwed = balances.filter(b => b.net_balance < 0).reduce((sum, b) => sum + Math.abs(b.net_balance), 0);
  const totalOwing = balances.filter(b => b.net_balance > 0).reduce((sum, b) => sum + b.net_balance, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Group Balances
        </CardTitle>
        <CardDescription>Who owes what in this group</CardDescription>
        
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>Total to receive: {formatAmount(totalOwing)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>Total to pay: {formatAmount(totalOwed)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => (
          <div key={balance.member_id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{balance.member_name}</h4>
                <div className="text-sm text-muted-foreground mt-1">
                  <span>Paid: {formatAmount(balance.total_paid)} • </span>
                  <span>Share: {formatAmount(balance.total_share)}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">
                  {balance.net_balance === 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Settled up
                    </Badge>
                  ) : balance.net_balance > 0 ? (
                    <div className="text-green-600">
                      +{formatAmount(balance.net_balance)}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      -{formatAmount(balance.net_balance)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {balance.net_balance === 0 
                    ? "All settled" 
                    : balance.net_balance > 0 
                    ? "Others owe you" 
                    : "You owe others"
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          onClick={loadBalances} 
          className="w-full"
        >
          Refresh Balances
        </Button>
      </CardContent>
    </Card>
  );
};