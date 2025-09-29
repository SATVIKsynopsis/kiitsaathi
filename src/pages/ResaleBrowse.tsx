import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, SlidersHorizontal, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  campus: number;
  created_at: string;
  seller: {
    full_name: string;
    rating_avg: number;
  };
  images: Array<{
    storage_path: string;
  }>;
}

export default function ResaleBrowse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [category, sortBy]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('resale_listings')
        .select(`
          *,
          seller:profiles!seller_id(full_name, rating_avg),
          images:resale_listing_images(storage_path)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery) {
      navigate(`/resale/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      fetchListings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Listings</h1>
          <p className="text-muted-foreground">Discover great deals from verified KIIT students</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-kiit-green" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No listings found</p>
            <Button
              onClick={() => navigate('/resale/new')}
              className="mt-4"
            >
              Be the first to list!
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigate(`/resale/${listing.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-square bg-gradient-to-br from-campus-blue/10 to-kiit-green/10 relative overflow-hidden">
                  {listing.images?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resale-public/${listing.images[0].storage_path}`}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to favourites
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-kiit-green transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-kiit-green">
                    ₹{listing.price.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="capitalize">{listing.condition}</span>
                    <span>Campus {listing.campus}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kiit-green to-campus-blue flex items-center justify-center text-white text-sm font-semibold">
                      {listing.seller?.full_name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.seller?.full_name || 'User'}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs text-muted-foreground">
                          {listing.seller?.rating_avg?.toFixed(1) || 'New'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}