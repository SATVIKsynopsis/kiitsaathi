import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookOpen, ShoppingCart, Filter, Star, MapPin } from 'lucide-react';
import { useBookBuyback } from '@/hooks/useBookBuyback';
import { toast } from '@/hooks/use-toast';

interface AvailableBook {
  id: string;
  condition: string;
  selling_price: number;
  semester_book: {
    book_name: string;
    author: string;
    edition: string;
    publisher: string;
    semester: number;
  };
  created_at: string;
}

export function BuyBooksSection() {
  const { bookConditions, fetchAvailableBooks } = useBookBuyback();
  const [availableBooks, setAvailableBooks] = useState<AvailableBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<AvailableBook[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    semester: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  });

  // Load available books
  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const books = await fetchAvailableBooks(filters);
      setAvailableBooks(books);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addToCart = (book: AvailableBook) => {
    setCart(prev => {
      const existing = prev.find(b => b.id === book.id);
      if (existing) {
        toast({
          title: "Already in cart",
          description: "This book is already in your cart",
          variant: "destructive"
        });
        return prev;
      }
      toast({
        title: "Added to cart",
        description: `${book.semester_book.book_name} added to cart`
      });
      return [...prev, book];
    });
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(b => b.id !== bookId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, book) => total + book.selling_price, 0);
  };

  const getConditionInfo = (condition: string) => {
    return bookConditions.find(c => c.value === condition);
  };

  const isInCart = (bookId: string) => {
    return cart.some(b => b.id === bookId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-poppins font-bold text-gradient mb-2">
          Buy Pre-Loved Books
        </h3>
        <p className="text-muted-foreground">
          Get quality books at great prices from fellow students
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="semester-filter">Semester</Label>
              <Select onValueChange={(value) => handleFilterChange('semester', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  <SelectItem value="1">1st Semester</SelectItem>
                  <SelectItem value="2">2nd Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition-filter">Condition</Label>
              <Select onValueChange={(value) => handleFilterChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Conditions</SelectItem>
                  {bookConditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      <div className="flex items-center gap-2">
                        <span>{condition.emoji}</span>
                        <span>{condition.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="min-price">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="₹0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="max-price">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="₹1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Books */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-semibold text-lg">Available Books ({availableBooks.length})</h4>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-kiit-green border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading books...</p>
            </div>
          ) : availableBooks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No books found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later for new listings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableBooks.map((book) => {
                const conditionInfo = getConditionInfo(book.condition);
                const inCart = isInCart(book.id);
                
                return (
                  <Card key={book.id} className={`hover:shadow-md transition-shadow ${inCart ? 'ring-2 ring-kiit-green' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <BookOpen className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-lg leading-tight mb-1">
                                {book.semester_book.book_name}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                by {book.semester_book.author} • {book.semester_book.edition}
                              </p>
                              {book.semester_book.publisher && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {book.semester_book.publisher}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">
                              Semester {book.semester_book.semester}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              {conditionInfo?.emoji}
                              {conditionInfo?.label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-kiit-green">
                                ₹{book.selling_price}
                              </span>
                            </div>
                            
                            <Button
                              onClick={() => inCart ? removeFromCart(book.id) : addToCart(book)}
                              variant={inCart ? "outline" : "default"}
                              size="sm"
                              className={inCart ? "text-red-600 hover:text-red-700" : ""}
                            >
                              {inCart ? "Remove" : "Add to Cart"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div>
          <Card className="glass-card sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((book) => {
                    const conditionInfo = getConditionInfo(book.condition);
                    return (
                      <div key={book.id} className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h6 className="font-medium text-sm leading-tight">
                            {book.semester_book.book_name}
                          </h6>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs">{conditionInfo?.emoji}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {book.condition}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{book.selling_price}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(book.id)}
                            className="text-red-500 hover:text-red-700 p-1 h-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <Separator />

                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-kiit-green">₹{getTotalPrice()}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={cart.length === 0}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Free pickup from seller's location or campus delivery available
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}