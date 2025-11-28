import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Phone, MapPin, Clock, Ticket, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const FoodShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };

  // Track page view on mount
  useEffect(() => {
    const trackPageView = async () => {
      if (!id) return;
      try {
        await fetch(`${HOSTED_URL}/api/food/shop/${id}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            viewType: 'page_view',
            userId: user?.id || null
          })
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };
    trackPageView();
  }, [id, user?.id]);

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/shop/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch shop');
      const data = await response.json();
      return data.shop;
    },
  });

  const { data: ratingData } = useQuery({
    queryKey: ['shop-rating', id],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/shop/${id}/rating`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch rating');
      return await response.json();
    },
  });

  const avgRating = ratingData?.avgRating || 0;
  const reviewCount = ratingData?.reviewCount || 0;

  const handleGenerateCoupon = () => {
    if (!user) {
      toast.error("Please sign in to generate coupons");
      navigate('/auth');
      return;
    }
    navigate(`/food/generate-coupon/${id}`);
  };

  const handleGetDirections = () => {
    if (shop?.lat && shop?.lng) {
      window.open(`https://www.google.com/maps?q=${shop.lat},${shop.lng}`, '_blank');
    } else {
      toast.error("Location not available");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background p-6 pt-24">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-96 w-full rounded-xl mb-6" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
      <Footer />
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-24">
          <p className="text-xl text-muted-foreground">Shop not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={shop.photos && shop.photos.length > 0 ? shop.photos[0] : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200'}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => navigate('/food')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-6xl">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            {/* Title and Tags */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{shop.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-sm">({reviewCount} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button size="lg" onClick={handleGenerateCoupon} className="gap-2">
                  <Ticket className="h-5 w-5" />
                  Generate Coupon
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {shop.tags && shop.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-lg text-muted-foreground">{shop.full_desc || shop.short_desc}</p>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {shop.contact_number && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <a href={`tel:${shop.contact_number}`} className="font-semibold hover:text-primary">
                          {shop.contact_number}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {shop.address && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold line-clamp-2">{shop.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {shop.delivery_timings && Object.keys(shop.delivery_timings).length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Timings</p>
                        <p className="font-semibold">Open Now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Menu Photos */}
            {shop.photos && shop.photos.length > 1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Menu & Photos</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {shop.photos.slice(1).map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`${shop.name} menu ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {shop.lat && shop.lng && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="rounded-lg overflow-hidden h-64 bg-muted relative">
                  <iframe
                    src={`https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={handleGetDirections}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default FoodShopDetail;