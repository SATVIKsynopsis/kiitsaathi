import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, FileSpreadsheet, FileJson } from "lucide-react";

interface ExportSummaryProps {
  groupId: string;
  groupName: string;
  currency: string;
}

export const ExportSummary = ({ groupId, groupName, currency }: ExportSummaryProps) => {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const { toast } = useToast();

  const exportData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('export_group_summary', {
        _group_id: groupId
      });

      if (error) throw error;
      
      if (format === 'csv') {
        exportAsCSV(data);
      } else {
        exportAsJSON(data);
      }
      
      toast({
        title: "Export successful! 📄",
        description: `Group summary exported as ${format.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsCSV = (data: any) => {
    const lines: string[] = [];
    
    // Add group header
    lines.push(`SplitSaathi Group Summary`);
    lines.push(`Group Name: "${data.group_info.name}"`);
    lines.push(`Description: "${data.group_info.description || 'No description'}"`);
    lines.push(`Currency: ${data.group_info.currency}`);
    lines.push(`Export Date: ${new Date().toLocaleDateString()}`);
    lines.push(`Created: ${new Date(data.group_info.created_at).toLocaleDateString()}`);
    lines.push('');
    
    // Add members
    lines.push('GROUP MEMBERS');
    lines.push('Name,Contact');
    if (data.members && data.members.length > 0) {
      data.members.forEach((member: any) => {
        lines.push(`"${member.name}","${member.email_phone}"`);
      });
    }
    lines.push('');
    
    // Add expenses
    lines.push('ALL EXPENSES');
    lines.push('Date,Title,Amount,Paid By,Notes');
    
    if (data.expenses && data.expenses.length > 0) {
      data.expenses.forEach((expense: any) => {
        const notes = expense.notes ? expense.notes.replace(/"/g, '""') : '';
        lines.push(`${expense.date},"${expense.title}",${expense.amount},"${expense.paid_by}","${notes}"`);
      });
    }
    lines.push('');
    
    // Add balances
    lines.push('FINAL BALANCES');
    lines.push('Member,Total Paid,Total Share,Net Balance,Status');
    
    if (data.balances && data.balances.length > 0) {
      data.balances.forEach((balance: any) => {
        const status = balance.net_balance > 0 ? 'Others owe them' : balance.net_balance < 0 ? 'They owe others' : 'Settled up';
        lines.push(`"${balance.member_name}",${balance.total_paid},${balance.total_share},${balance.net_balance},"${status}"`);
      });
    }
    lines.push('');
    
    // Add settlement instructions
    if (data.simplified_debts && data.simplified_debts.length > 0) {
      lines.push('SETTLEMENT INSTRUCTIONS');
      lines.push('Step,Who Should Pay,Who Should Receive,Amount,Instructions');
      data.simplified_debts.forEach((debt: any, index: number) => {
        lines.push(`${index + 1},"${debt.from}","${debt.to}",${debt.amount},"${debt.from} should pay ${currency}${debt.amount} to ${debt.to}"`);
      });
      lines.push('');
      lines.push(`Total Transactions Required: ${data.simplified_debts.length}`);
    } else {
      lines.push('SETTLEMENT STATUS');
      lines.push('Status: All debts are already settled!');
    }
    
    downloadFile(lines.join('\n'), `${groupName}-summary.csv`, 'text/csv');
  };

  const exportAsJSON = (data: any) => {
    const exportData = {
      group_summary: {
        ...data.group_info,
        export_date: new Date().toISOString(),
        total_members: data.members?.length || 0,
        total_expenses: data.expenses?.length || 0,
        total_amount: data.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0
      },
      members: data.members || [],
      expenses: data.expenses || [],
      balances: (data.balances || []).map((balance: any) => ({
        ...balance,
        status: balance.net_balance > 0 ? 'owed_money' : balance.net_balance < 0 ? 'owes_money' : 'settled',
        amount_description: balance.net_balance > 0 
          ? `Others owe ${currency}${Math.abs(balance.net_balance)}` 
          : balance.net_balance < 0 
          ? `Owes ${currency}${Math.abs(balance.net_balance)}`
          : 'All settled up'
      })),
      settlement_plan: {
        transactions_needed: data.simplified_debts?.length || 0,
        status: (data.simplified_debts?.length || 0) === 0 ? 'all_settled' : 'pending_settlements',
        instructions: (data.simplified_debts || []).map((debt: any, index: number) => ({
          step: index + 1,
          from: debt.from,
          to: debt.to,
          amount: debt.amount,
          instruction: `${debt.from} should pay ${currency}${debt.amount} to ${debt.to}`
        }))
      },
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: 'SplitSaathi',
        version: '2.0',
        format: 'json'
      }
    };
    
    downloadFile(
      JSON.stringify(exportData, null, 2), 
      `${groupName}-summary.json`, 
      'application/json'
    );
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Export Summary
        </CardTitle>
        <CardDescription>
          Download complete group data including expenses, balances, and settlements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export format</label>
          <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV (Spreadsheet)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON (Data)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Export includes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Complete group information and member details</li>
            <li>• All expenses with splits and payment details</li>
            <li>• Current balances for each member</li>
            <li>• Step-by-step settlement instructions</li>
            <li>• Who-owes-whom breakdown for easy sharing</li>
            <li>• Export timestamp and metadata</li>
          </ul>
          
          <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
            💡 <strong>Tip:</strong> Share the CSV file with your group so everyone knows exactly what to pay!
          </div>
        </div>
        
        <Button 
          onClick={exportData} 
          disabled={loading}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
};