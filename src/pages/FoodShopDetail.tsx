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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

const FoodShopDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  
  // Menu filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';

  // Check for missing shop ID
  if (!shopId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-24">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <p className="text-xl text-muted-foreground mb-2">Invalid shop URL</p>
              <p className="text-sm text-muted-foreground mb-4">
                Shop ID is missing from the URL
              </p>
              <Button onClick={() => navigate('/food')}>
                Back to Directory
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }
  
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
      if (!shopId) return;
      try {
        await fetch(`${HOSTED_URL}/api/food/shop/${shopId}/view`, {
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
  }, [shopId, user?.id]);

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shops/${shopId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch shop');
      const data = await response.json();
      return data.shop;
    },
  });

  const { data: ratingData } = useQuery({
    queryKey: ['shop-rating', shopId],
    queryFn: async () => {
      const response = await fetch(`${HOSTED_URL}/api/food/shop/${shopId}/rating`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch rating');
      return await response.json();
    },
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['shop-menu', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      // Try the shop_menu_items API first (this should work now)
      try {
        const response = await fetch(`${HOSTED_URL}/api/food/shop/${shopId}/menu`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('===== MENU API RESPONSE DEBUG =====');
          console.log('Full response data:', data);
          console.log('Menu items from API:', data.menuItems);
          console.log('Menu items length:', data.menuItems?.length || 0);
          console.log('======================================');
          return data.menuItems || [];
        }
      } catch (error) {
        console.error('Menu API error:', error);
      }
      
      // Fallback: fetch directly from shop_menu_items table
      try {
        const response = await fetch(`${HOSTED_URL}/api/food/admin/shops/${shopId}`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Menu items from admin API:', data.shop?.menu_items);
          return data.shop?.menu_items || [];
        }
      } catch (error) {
        console.error('Admin API error:', error);
      }
      
      return [];
    },
    enabled: !!shopId,
  });

  const avgRating = ratingData?.avgRating || 0;
  const reviewCount = ratingData?.reviewCount || 0;

  const handleGenerateCoupon = () => {
    if (!user) {
      toast.error("Please sign in to generate coupons");
      navigate('/auth');
      return;
    }
    navigate(`/food/generate-coupon/${shopId}`);
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

              <p className="text-lg text-muted-foreground">
                {shop.description || shop.full_desc || shop.short_desc}
              </p>
            </div>

            {/* Enhanced Info Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
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

              {shop.location && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold line-clamp-2">{shop.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(shop.opening_hours || shop.closing_hours) && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hours</p>
                        <p className="font-semibold">
                          {shop.opening_hours ? `${shop.opening_hours}` : ''}
                          {shop.opening_hours && shop.closing_hours ? ' - ' : ''}
                          {shop.closing_hours ? `${shop.closing_hours}` : ''}
                        </p>
                        {shop.is_active !== false && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {shop.is_active ? 'Open' : 'Closed'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {shop.category && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-primary/20 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {shop.category.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-semibold capitalize">{shop.category}</p>
                        {shop.featured && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Menu Items */}
            {(() => {
              // Use menuItems from the dedicated API call, not shop.menu_items
              const allMenuItems = menuItems || [];
              
              // Normalize categories for better matching
              const normalizeCategory = (category: string) => {
                const normalized = category.toLowerCase().trim();
                const categoryMap: Record<string, string> = {
                  'main course': 'Main Course',
                  'maincourse': 'Main Course', 
                  'main': 'Main Course',
                  'fast food': 'Fast Food',
                  'fastfood': 'Fast Food',
                  'snacks': 'Snacks',
                  'snack': 'Snacks',
                  'beverages': 'Beverages',
                  'drinks': 'Beverages',
                  'beverage': 'Beverages',
                  'drink': 'Beverages',
                  'desserts': 'Desserts',
                  'dessert': 'Desserts',
                  'sweets': 'Desserts'
                };
                return categoryMap[normalized] || category;
              };

              // Get unique categories
              const categories = ['All', ...Array.from(new Set(
                allMenuItems.map(item => normalizeCategory(item.category || 'Other'))
              ))];

              // Filter menu items
              const filteredItems = allMenuItems.filter(item => {
                const matchesCategory = selectedCategory === 'All' || 
                  normalizeCategory(item.category || 'Other') === selectedCategory;
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
                return matchesCategory && matchesSearch;
              });

              // Group filtered items by normalized category
              const groupedItems = filteredItems.reduce((acc: Record<string, any[]>, item: any) => {
                const category = normalizeCategory(item.category || 'Other');
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(item);
                return acc;
              }, {});

              console.log('Menu items debug:', { 
                allMenuItems,
                filteredItems: filteredItems.length,
                shopId: shopId
              });
              
              if (allMenuItems.length === 0) {
                return (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Menu</h2>
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No menu items available at the moment.</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              }

              return (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      Menu
                      <Badge variant="outline">
                        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </h2>
                  </div>

                  {/* Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filter by:</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {categories.map((category: string) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="text-xs"
                          >
                            {category}
                            {category !== 'All' && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {allMenuItems.filter(item => 
                                  normalizeCategory(item.category || 'Other') === category
                                ).length}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Search */}
                    <Input
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                  </div>

                  {/* Menu Items Grid */}
                  {Object.keys(groupedItems).length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No items found matching your criteria.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedItems).map(([category, items]: [string, any[]]) => (
                        <Card key={category} className="overflow-hidden">
                          <div className="bg-muted/50 px-6 py-3 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                              <span className="capitalize">{category}</span>
                              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                            </h3>
                          </div>
                          <CardContent className="p-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
                              {items.map((item: any, index: number) => (
                                <div 
                                  key={item.id} 
                                  className={`p-3 border-r border-b hover:bg-accent/50 transition-colors ${
                                    index % 3 === 2 ? 'md:border-r-0' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Item Photo */}
                                    {(item.photos && item.photos.length > 0 || item.image_url) && (
                                      <div className="flex-shrink-0">
                                        {item.photos && item.photos.length > 0 ? (
                                          <img
                                            src={item.photos[0]}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-md border"
                                          />
                                        ) : (
                                          <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-md border"
                                          />
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                                            {item.is_veg && (
                                              <div className="w-3 h-3 border border-green-500 flex items-center justify-center rounded-sm flex-shrink-0">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                              </div>
                                            )}
                                          </div>
                                          {item.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right ml-2">
                                          <span className="font-bold text-primary text-sm">₹{item.price}</span>
                                          {!item.is_available && (
                                            <div>
                                              <Badge variant="destructive" className="text-xs px-1 py-0 mt-1">
                                                Out of Stock
                                              </Badge>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Menu Photos */}
            {shop.photos && shop.photos.length > 1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Photos</h2>
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