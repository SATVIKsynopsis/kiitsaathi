import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResaleFavourites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('resale_favourites')
        .select(`
          *,
          listing:resale_listings (
            id,
            title,
            description,
            price,
            category,
            condition,
            campus,
            status,
            created_at,
            seller:seller_id (
              full_name,
              rating_avg
            ),
            images:resale_listing_images (
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavourites(data || []);
    } catch (error) {
      console.error('Error fetching favourites:', error);
      toast({
        title: "Error",
        description: "Failed to load favourites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavourite = async (favouriteId: string) => {
    try {
      const { error } = await supabase
        .from('resale_favourites')
        .delete()
        .eq('id', favouriteId);

      if (error) throw error;

      toast({
        title: "Removed from favourites",
        description: "Item has been removed from your favourites"
      });

      fetchFavourites();
    } catch (error) {
      console.error('Error removing favourite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favourite",
        variant: "destructive"
      });
    }
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
        <h1 className="text-3xl font-bold mb-6">My Favourites</h1>

        {favourites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No favourites yet</p>
              <Button
                onClick={() => navigate('/resale/browse')}
                className="mt-4"
              >
                Browse Listings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((fav) => {
              const listing = fav.listing;
              if (!listing) return null;

              const firstImage = listing.images?.[0]?.image_url;

              return (
                <Card key={fav.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="relative h-48 bg-muted cursor-pointer"
                    onClick={() => navigate(`/resale/${listing.id}`)}
                  >
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavourite(fav.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                    {listing.status !== 'active' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="secondary">Not Available</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                      <p className="font-bold text-primary">₹{listing.price}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Campus {listing.campus}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {listing.condition}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => navigate(`/resale/${listing.id}`)}
                      className="w-full mt-4"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}