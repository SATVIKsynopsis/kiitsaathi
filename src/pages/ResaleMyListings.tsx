import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function ResaleMyListings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('resale_listings')
        .select(`
          *,
          images:resale_listing_images (
            image_url
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resale_listings')
        .update({ status: 'sold' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Marked as sold",
        description: "Your listing has been marked as sold"
      });
      fetchMyListings();
    } catch (error) {
      console.error('Error marking as sold:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resale_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Listing deleted",
        description: "Your listing has been removed"
      });
      setDeleteDialog(null);
      fetchMyListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      active: 'default',
      sold: 'outline',
      removed: 'destructive'
    };
    const labels: any = {
      pending: '⏳ Pending Approval',
      active: '✅ Active',
      sold: '🎉 Sold',
      removed: '❌ Removed'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Button onClick={() => navigate('/resale/new')}>
            + New Listing
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You haven't listed anything yet</p>
              <Button onClick={() => navigate('/resale/new')}>
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const firstImage = listing.images?.[0]?.image_url;

              return (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                      <p className="font-bold text-primary">₹{listing.price}</p>
                    </div>
                    <div className="mb-3">
                      {getStatusBadge(listing.status)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => navigate(`/resale/${listing.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {listing.status === 'active' && (
                        <Button
                          onClick={() => handleMarkSold(listing.id)}
                          variant="outline"
                          size="sm"
                        >
                          Mark Sold
                        </Button>
                      )}
                      <Button
                        onClick={() => setDeleteDialog(listing.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}