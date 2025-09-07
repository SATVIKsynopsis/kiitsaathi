import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Users, DollarSign, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";

interface Balance {
  member_id: string;
  member_name: string;
  member_email: string;
  total_paid: number;
  total_share: number;
  net_balance: number;
}

interface Settlement {
  from_name: string;
  to_name: string;
  amount: number;
}

interface ViewBalancesProps {
  groupId: string;
  currency: string;
}

export const ViewBalances = ({ groupId, currency }: ViewBalancesProps) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBalances();
    
    // Set up realtime subscription for expense changes
    const channel = supabase
      .channel('expense-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          console.log('Expense changed, reloading balances...');
          loadBalances();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expense_splits',
        },
        () => {
          console.log('Expense splits changed, reloading balances...');
          loadBalances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    // Filter out members with minimal balances (within 1 cent)
    const creditors = balances
      .filter(b => b.net_balance > 0.01)
      .sort((a, b) => b.net_balance - a.net_balance)
      .map(c => ({ ...c })); // Create copies

    const debtors = balances
      .filter(b => b.net_balance < -0.01)
      .sort((a, b) => a.net_balance - b.net_balance)
      .map(d => ({ ...d })); // Create copies
    
    const settlements: Settlement[] = [];
    let creditorIndex = 0;
    let debtorIndex = 0;
    
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      
      const settlementAmount = Math.min(
        Math.round(creditor.net_balance * 100) / 100,
        Math.round(Math.abs(debtor.net_balance) * 100) / 100
      );
      
      if (settlementAmount > 0.01) {
        settlements.push({
          from_name: debtor.member_name,
          to_name: creditor.member_name,
          amount: settlementAmount
        });
      }
      
      creditor.net_balance = Math.round((creditor.net_balance - settlementAmount) * 100) / 100;
      debtor.net_balance = Math.round((debtor.net_balance + settlementAmount) * 100) / 100;
      
      if (Math.abs(creditor.net_balance) < 0.01) creditorIndex++;
      if (Math.abs(debtor.net_balance) < 0.01) debtorIndex++;
    }
    
    return settlements;
  };

  const loadBalances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('calculate_group_balances', {
        _group_id: groupId
      });

      if (error) throw error;
      const balanceData = data || [];
      setBalances(balanceData);
      
      // Calculate settlements with the updated balance data
      const settlements = calculateSettlements(balanceData);
      setSettlements(settlements);
      
      console.log('Balance data loaded:', balanceData);
      console.log('Settlements calculated:', settlements);
    } catch (error: any) {
      console.error('Error loading balances:', error);
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

        {/* Settlement Suggestions */}
        {settlements.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Settlement Suggestions</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Here's how to settle all debts with {settlements.length} simple transaction{settlements.length !== 1 ? 's' : ''}:
              </p>
              
              <div className="space-y-3">
                {settlements.map((settlement, index) => (
                  <div 
                    key={`${settlement.from_name}-${settlement.to_name}-${index}`}
                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-800">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-medium text-green-900">{settlement.from_name}</span>
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">{settlement.to_name}</span>
                    </div>
                    <div className="font-bold text-green-700">
                      {formatAmount(settlement.amount)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> After these payments, everyone will be settled up! 
                  Copy this list to share with your group.
                </p>
              </div>
            </div>
          </>
        )}
        
        <Button 
          variant="outline" 
          onClick={loadBalances} 
          className="w-full mt-4"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Balances'}
        </Button>
      </CardContent>
    </Card>
  );
};