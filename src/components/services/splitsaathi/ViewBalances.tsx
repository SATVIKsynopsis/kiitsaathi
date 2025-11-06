import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, TrendingUp, TrendingDown, Users, CheckCircle2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email_phone: string;
}

interface Balance {
  member_id: string;
  member_name: string;
  total_paid: number;
  total_owed: number;
  net_balance: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface ViewBalancesProps {
  groupId: string;
  currency: string;
}

export const ViewBalances = ({ groupId, currency }: ViewBalancesProps) => {
  const { toast } = useToast();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateBalances();
  }, [groupId]);

  const calculateBalances = async () => {
    try {
      setLoading(true);

      // Fetch all expenses and their splits for this group
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select(`
          id,
          amount,
          paid_by_member_id,
          group_members!expenses_paid_by_member_id_fkey(id, name, email_phone),
          expense_splits(
            member_id,
            amount,
            group_members(id, name, email_phone)
          )
        `)
        .eq("group_id", groupId);

      if (expensesError) throw expensesError;

      // Calculate balances for each member
      const memberBalances = new Map<string, Balance>();

      expenses?.forEach((expense: any) => {
        const paidByMemberId = expense.paid_by_member_id;
        const paidByMemberName = expense.group_members.name;

        // Initialize balance for payer if not exists
        if (!memberBalances.has(paidByMemberId)) {
          memberBalances.set(paidByMemberId, {
            member_id: paidByMemberId,
            member_name: paidByMemberName,
            total_paid: 0,
            total_owed: 0,
            net_balance: 0,
          });
        }

        // Add to total paid
        const payerBalance = memberBalances.get(paidByMemberId)!;
        payerBalance.total_paid += expense.amount;

        // Process splits
        expense.expense_splits?.forEach((split: any) => {
          const memberId = split.member_id;
          const memberName = split.group_members.name;

          // Initialize balance for member if not exists
          if (!memberBalances.has(memberId)) {
            memberBalances.set(memberId, {
              member_id: memberId,
              member_name: memberName,
              total_paid: 0,
              total_owed: 0,
              net_balance: 0,
            });
          }

          // Add to total owed
          const memberBalance = memberBalances.get(memberId)!;
          memberBalance.total_owed += split.amount;
        });
      });

      // Calculate net balances
      const balancesArray = Array.from(memberBalances.values()).map((balance) => ({
        ...balance,
        net_balance: balance.total_paid - balance.total_owed,
      }));

      setBalances(balancesArray);

      // Calculate optimal settlements
      const settlementsArray = calculateSettlements(balancesArray);
      setSettlements(settlementsArray);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to calculate balances: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
      .filter((b) => b.net_balance > 0.01)
      .map((b) => ({ name: b.member_name, amount: b.net_balance }))
      .sort((a, b) => b.amount - a.amount);

    const debtors = balances
      .filter((b) => b.net_balance < -0.01)
      .map((b) => ({ name: b.member_name, amount: Math.abs(b.net_balance) }))
      .sort((a, b) => b.amount - a.amount);

    const settlements: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const settleAmount = Math.min(creditor.amount, debtor.amount);

      if (settleAmount > 0.01) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.round(settleAmount * 100) / 100,
        });
      }

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return settlements;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Calculating balances...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOwed = balances.reduce((sum, b) => sum + (b.net_balance > 0 ? b.net_balance : 0), 0);
  const totalDebt = balances.reduce((sum, b) => sum + (b.net_balance < 0 ? Math.abs(b.net_balance) : 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Balance Summary
          </CardTitle>
          <CardDescription>
            Overall financial status of the group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                Total to Receive
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {currency}{totalOwed.toFixed(2)}
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <div className="text-sm text-red-700 dark:text-red-300 mb-1">
                Total to Pay
              </div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                {currency}{totalDebt.toFixed(2)}
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                Settlements Needed
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {settlements.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Balances</CardTitle>
          <CardDescription>
            Each member's financial standing in the group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((balance) => (
                <div
                  key={balance.member_id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {balance.member_name}
                        {Math.abs(balance.net_balance) < 0.01 && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Settled
                          </Badge>
                        )}
                      </h4>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Paid: {currency}{balance.total_paid.toFixed(2)}</span>
                        <span>Owes: {currency}{balance.total_owed.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {balance.net_balance > 0.01 ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold text-lg">
                            +{currency}{balance.net_balance.toFixed(2)}
                          </span>
                        </div>
                      ) : balance.net_balance < -0.01 ? (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <TrendingDown className="w-4 h-4" />
                          <span className="font-bold text-lg">
                            {currency}{Math.abs(balance.net_balance).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-medium">
                          All settled ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Settlements</CardTitle>
          <CardDescription>
            Optimal way to settle all debts with minimum transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">All Settled!</h3>
              <p className="text-muted-foreground">
                Everyone is square. No settlements needed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{settlement.from}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{settlement.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-orange-700 dark:text-orange-300">
                        {currency}{settlement.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};