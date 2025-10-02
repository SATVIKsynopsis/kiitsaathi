import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ResaleTransactions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('resale_transactions')
        .select(`
          *,
          listing:resale_listings (
            id,
            title,
            price,
            category
          ),
          buyer:buyer_id (
            full_name,
            email
          ),
          seller:seller_id (
            full_name,
            email
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      const { error } = await supabase.functions.invoke('confirm-resale-delivery', {
        body: { transactionId: selectedTx.id }
      });

      if (error) throw error;

      toast({
        title: "Delivery Confirmed",
        description: "Funds have been released to the seller"
      });
      
      setShowConfirmDialog(false);
      setShowReviewDialog(true);
      fetchTransactions();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('resale_reviews')
        .insert({
          transaction_id: selectedTx.id,
          reviewer_id: user.id,
          reviewee_id: selectedTx.seller_id,
          rating: reviewRating,
          review_text: reviewText
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });

      setShowReviewDialog(false);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      escrow: 'secondary',
      delivered: 'default',
      completed: 'default',
      cancelled: 'destructive'
    };
    const labels: any = {
      escrow: '⏳ In Escrow',
      delivered: '📦 Delivered',
      completed: '✅ Completed',
      cancelled: '❌ Cancelled'
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <Clock className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Transactions</h1>

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No transactions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const { data: { user } } = supabase.auth.getUser() as any;
                const isBuyer = tx.buyer_id === user?.id;
                
                return (
                  <Card key={tx.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{tx.listing?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {isBuyer ? 'Bought from' : 'Sold to'}: {isBuyer ? tx.seller?.full_name : tx.buyer?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{tx.amount}</p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        {isBuyer && tx.status === 'escrow' && (
                          <Button
                            onClick={() => {
                              setSelectedTx(tx);
                              setShowConfirmDialog(true);
                            }}
                            variant="default"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Delivery
                          </Button>
                        )}
                        
                        {tx.status === 'completed' && (
                          <Button
                            onClick={() => {
                              setSelectedTx(tx);
                              setShowReviewDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                          </Button>
                        )}

                        <Button
                          onClick={() => navigate(`/resale/${tx.listing_id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Listing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delivery Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Have you received the item and verified its condition? Funds will be released to the seller immediately.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelivery}>Confirm & Release Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="text-2xl"
                  >
                    {star <= reviewRating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Skip</Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}