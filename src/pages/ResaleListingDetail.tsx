import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart,
  MessageCircle,
  MapPin,
  Package,
  Truck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Flag,
  Star,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  campus: number;
  pickup_option: string;
  delivery_fee: number;
  is_exchange: boolean;
  exchange_with: any;
  created_at: string;
  views: number;
  seller: {
    id: string;
    full_name: string;
    rating_avg: number;
    total_sales: number;
  };
  images: Array<{
    storage_path: string;
    display_order: number;
  }>;
}

export default function ResaleListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
      checkIfFavorited();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resale_listings')
        .select(`
          *,
          seller:profiles!seller_id(id, full_name, rating_avg, total_sales),
          images:resale_listing_images(storage_path, display_order)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Sort images by display order
      if (data.images) {
        data.images.sort((a, b) => a.display_order - b.display_order);
      }
      
      setListing(data);

      // Increment view count
      await supabase
        .from('resale_listings')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorited = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('resale_favourites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', id)
      .single();

    setIsFavorited(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from('resale_favourites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('resale_favourites')
          .insert({
            user_id: user.id,
            listing_id: id,
          });
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleChat = async () => {
    if (!user) {
      navigate('/auth', { state: { from: `/resale/${id}` } });
      return;
    }

    if (user.id === listing?.seller.id) {
      toast.error('You cannot chat with yourself');
      return;
    }

    try {
      // Create or get existing conversation
      const { data: existingConvo } = await supabase
        .from('resale_conversations')
        .select('id')
        .eq('listing_id', id)
        .eq('buyer_id', user.id)
        .eq('seller_id', listing?.seller.id)
        .single();

      if (existingConvo) {
        navigate(`/resale/chat/${existingConvo.id}`);
      } else {
        const { data: newConvo, error } = await supabase
          .from('resale_conversations')
          .insert({
            listing_id: id,
            buyer_id: user.id,
            seller_id: listing?.seller.id,
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/resale/chat/${newConvo.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kiit-green" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Listing not found</p>
      </div>
    );
  }

  const images = listing.images || [];
  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
                {currentImage ? (
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resale-public/${currentImage.storage_path}`}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">📦</span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-kiit-green' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resale-public/${img.storage_path}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className={isFavorited ? 'text-red-500' : ''}
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">{listing.category}</Badge>
                <Badge variant="outline" className="capitalize">{listing.condition}</Badge>
                {listing.is_exchange && <Badge className="bg-gradient-to-r from-kiit-green to-campus-blue">Exchange Available</Badge>}
              </div>

              <p className="text-4xl font-bold text-kiit-green mb-4">
                ₹{listing.price.toLocaleString()}
              </p>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>Campus {listing.campus}</span>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                {listing.pickup_option === 'pickup' ? (
                  <Package className="w-5 h-5" />
                ) : (
                  <Truck className="w-5 h-5" />
                )}
                <span className="capitalize">{listing.pickup_option.replace('-', ' ')}</span>
                {listing.delivery_fee > 0 && <span>(+₹{listing.delivery_fee} delivery)</span>}
              </div>

              {listing.is_exchange && listing.exchange_with?.items && (
                <div className="flex items-start gap-3 text-muted-foreground">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Exchange for:</p>
                    <p>{listing.exchange_with.items}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Seller Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 bg-gradient-to-br from-kiit-green to-campus-blue">
                  <AvatarFallback className="text-white font-semibold">
                    {listing.seller.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{listing.seller.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                      <span>{listing.seller.rating_avg?.toFixed(1) || 'New'}</span>
                    </div>
                    <span>•</span>
                    <span>{listing.seller.total_sales || 0} sales</span>
                  </div>
                </div>
              </div>

              {user?.id !== listing.seller.id && (
                <Button
                  onClick={handleChat}
                  className="w-full bg-gradient-to-r from-kiit-green to-campus-blue"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with Seller
                </Button>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}