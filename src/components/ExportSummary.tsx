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
    lines.push(`Group Summary: ${data.group_info.name}`);
    lines.push(`Currency: ${data.group_info.currency}`);
    lines.push(`Export Date: ${new Date().toLocaleDateString()}`);
    lines.push('');
    
    // Add expenses
    lines.push('EXPENSES');
    lines.push('Date,Title,Amount,Paid By,Notes');
    
    if (data.expenses && data.expenses.length > 0) {
      data.expenses.forEach((expense: any) => {
        const notes = expense.notes ? expense.notes.replace(/,/g, ';') : '';
        lines.push(`${expense.date},${expense.title},${expense.amount},${expense.paid_by},"${notes}"`);
      });
    }
    
    lines.push('');
    
    // Add balances
    lines.push('BALANCES');
    lines.push('Member,Total Paid,Total Share,Net Balance');
    
    if (data.balances && data.balances.length > 0) {
      data.balances.forEach((balance: any) => {
        lines.push(`${balance.member_name},${balance.total_paid},${balance.total_share},${balance.net_balance}`);
      });
    }
    
    lines.push('');
    
    // Add simplified debts
    lines.push('SIMPLIFIED DEBTS');
    lines.push('From,To,Amount');
    
    if (data.simplified_debts && data.simplified_debts.length > 0) {
      data.simplified_debts.forEach((debt: any) => {
        lines.push(`${debt.from},${debt.to},${debt.amount}`);
      });
    } else {
      lines.push('No debts - all settled!');
    }
    
    downloadFile(lines.join('\n'), `${groupName}-summary.csv`, 'text/csv');
  };

  const exportAsJSON = (data: any) => {
    const exportData = {
      ...data,
      exported_at: new Date().toISOString(),
      export_format: 'json'
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
            <li>• Group information and members</li>
            <li>• All expenses with details and splits</li>
            <li>• Current member balances</li>
            <li>• Simplified debt settlement plan</li>
            <li>• Export timestamp for records</li>
          </ul>
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