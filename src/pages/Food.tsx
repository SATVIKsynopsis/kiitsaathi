import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Star, Store, ShieldCheck } from "lucide-react";
import ShopCard from "@/components/food/ShopCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

const Food = () => {
  const { user, loading, accessToken } = useAuth();
  const navigate = useNavigate();
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await fetch(`${HOSTED_URL}/api/auth/session`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        return { is_admin: data.profile?.is_admin || false };
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Check if user is a shopkeeper
  const { data: shopkeeperShop } = useQuery({
    queryKey: ['shopkeeper-shop', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await fetch(`${HOSTED_URL}/api/food/shopkeeper/shop`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.shopStaff ? { ...data.shopStaff, shops: data.shop } : null;
      } catch (error) {
        console.error('Error fetching shopkeeper shop:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Check if current user is admin (same logic as navbar)
  const isAdmin = user?.email === 'adityash8997@gmail.com' || user?.email === '24155598@kiit.ac.in';

  // Debug admin status
  console.log('🔍 Admin Debug Info:', { 
    user: user?.id, 
    userEmail: user?.email,
    profile, 
    isAdmin, 
    shopkeeperShop: shopkeeperShop?.shop_id 
  });

  const { data: shops, isLoading, error } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      console.log('🔍 Fetching shops from backend...');
      const response = await fetch(`${HOSTED_URL}/api/food/shops`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }
      
      const data = await response.json();
      console.log('✅ Shops data:', data.shops);
      return data.shops;
    },
  });

  // Debug logging
  console.log('Debug Info:', { shops, isLoading, error, shopsLength: shops?.length });

  const featuredShops = shops?.filter(shop => shop.featured) || [];
  const allShops = shops || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          
          {/* Admin/Shopkeeper Dashboard Access */}
          {user && (isAdmin || shopkeeperShop) && (
            <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Admin Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Manage shopkeepers and shop assignments</p>
                    </div>
                  </div>
                )}
                {shopkeeperShop && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-lg">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Shopkeeper Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        Managing: {(shopkeeperShop as any)?.shops?.name || 'Your Shop'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  {isAdmin && (
                    <Button 
                      onClick={() => navigate('/food/admin/shopkeepers')}
                      className="gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  {shopkeeperShop && (
                    <Button 
                      onClick={() => navigate('/food/shopkeeper')}
                      className="gap-2"
                    >
                      <Store className="h-4 w-4" />
                      Shopkeeper Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            KIIT Food Stalls & Restaurants
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover the best food on campus. Generate coupons, check menus, and save on your favorites!
          </p>

          {/* Search and Filters */}
          <div className="bg-card p-6 rounded-xl shadow-lg">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search shops, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Campus Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="North Campus">North Campus</SelectItem>
                  <SelectItem value="South Campus">South Campus</SelectItem>
                  <SelectItem value="Central Zone">Central Zone</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <Star className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="canteen">Canteen</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="fast-food">Fast Food</SelectItem>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Shops */}
      {featuredShops.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-3xl font-bold text-foreground">Featured Shops</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}

      {/* All Shops */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-foreground mb-6">All Shops</h2>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : allShops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No shops found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
};

export default Food;