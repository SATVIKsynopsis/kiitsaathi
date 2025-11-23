import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Gift, DollarSign, Sparkles } from 'lucide-react';
import { SelectedBook } from '@/hooks/useBookBuyback';

interface PricingSummaryProps {
  selectedBooks: SelectedBook[];
  totalEstimatedPrice: number;
  isFullSemesterSet: boolean;
  bonusAmount: number;
  finalTotal: number;
}

export function PricingSummary({
  selectedBooks,
  totalEstimatedPrice,
  isFullSemesterSet,
  bonusAmount,
  finalTotal
}: PricingSummaryProps) {
  if (selectedBooks.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-muted-foreground mb-2">
            Select books to see pricing
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose your books and their condition to get an estimate
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Books List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Selected Books ({selectedBooks.length})
          </h4>
          {selectedBooks.map((book) => (
            <div key={book.id} className="flex justify-between items-center text-sm">
              <div className="flex-1 truncate pr-2">
                <div className="font-medium truncate">{book.book_name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {book.condition === 'mint' && '📗'}
                  {book.condition === 'good' && '📘'}
                  {book.condition === 'fair' && '📙'}
                  <span className="capitalize">{book.condition}</span>
                </div>
              </div>
              <div className="font-semibold">
                ₹{book.estimated_price}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Base Total</span>
            <span className="font-semibold">₹{totalEstimatedPrice}</span>
          </div>

          {isFullSemesterSet && (
            <div className="flex justify-between items-center text-green-600">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="text-sm">Full Set Bonus (10%)</span>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Special
                </Badge>
              </div>
              <span className="font-semibold">+₹{bonusAmount}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center text-lg font-bold text-kiit-green">
            <span>Final Amount</span>
            <span>₹{finalTotal}</span>
          </div>
        </div>

        {/* Bonus Info */}
        {isFullSemesterSet && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              Full Semester Set Bonus!
            </div>
            <p className="text-xs text-green-600">
              You're selling all books from this semester. Earn an extra 10% bonus!
            </p>
          </div>
        )}

        {!isFullSemesterSet && selectedBooks.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
              <Gift className="w-4 h-4" />
              Bonus Opportunity
            </div>
            <p className="text-xs text-blue-600">
              Sell all semester books to get an extra 10% bonus on your total amount!
            </p>
          </div>
        )}

        {/* Payment Note */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700">
            💡 <strong>Fair pricing:</strong> Our prices are based on book condition, demand, and current market value - not just weight!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}