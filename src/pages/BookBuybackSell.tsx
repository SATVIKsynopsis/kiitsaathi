import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookOpen, ShoppingCart, DollarSign, Package, Plus, Minus, Check, Tag, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuestBrowsingBanner } from '@/components/services/book-buy-sell/GuestBrowsingBanner';
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute } from '@/components/services/book-buy-sell/ProtectedRoute';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useSemesterBooks } from '@/hooks/useSemesterBooks';

const BookBuybackSell = () => {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const {
    books,
    combos,
    selectedBooks,
    selectedCombo,
    isLoading,
    isSubmitting,
    isAuthenticated,
    fetchSemesterData,
    toggleBookSelection,
    selectCombo,
    clearSelection,
    calculateTotal,
    getSelectedBookDetails,
    getSelectedComboDetails,
    submitSelection
  } = useSemesterBooks();

  useEffect(() => {
    if (selectedSemester) {
      fetchSemesterData(selectedSemester);
    }
  }, [selectedSemester]);

  const handleSemesterChange = (semester: string) => {
    const semesterNum = parseInt(semester);
    setSelectedSemester(semesterNum);
    clearSelection();
  };

  const handleSubmitSelection = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to continue');
      return;
    }

    if (selectedBooks.length === 0 && !selectedCombo) {
      alert('Please select books or a combo first');
      return;
    }

    if (!selectedSemester) {
      alert('Please select a semester first');
      return;
    }

    try {
      await submitSelection({
        selectedBooks,
        selectedCombo: selectedCombo || undefined,
        totalAmount: calculateTotal(),
        semester: selectedSemester,
        action,
        userDetails
      });
      setShowUserForm(false);
      setUserDetails({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Failed to submit selection:', error);
    }
  };

  const hasSelection = selectedBooks.length > 0 || selectedCombo;
  const selectedBookDetails = getSelectedBookDetails();
  const selectedComboDetails = getSelectedComboDetails();
  const total = calculateTotal();

  return (
    <>
      <Navbar />
      {!isAuthenticated && <GuestBrowsingBanner />}
      
      <main className="min-h-screen pt-20 bg-gradient-to-br from-kiit-green-soft to-white">
        <div className="container mx-auto px-4 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
              <BookOpen className="w-4 h-4" />
              Semester-Based Book Selection
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
              📚 Smart Book Exchange
              <span className="block">By Semester</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Select your semester, choose individual books or complete combos, and get the best value. 
              <span className="font-semibold text-kiit-green"> Value-based pricing, not weight-based.</span>
            </p>
          </div>

          {/* Action Selection */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-muted bg-background p-1">
              <Button
                variant={action === 'buy' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAction('buy')}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Books
              </Button>
              <Button
                variant={action === 'sell' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAction('sell')}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Sell Books
              </Button>
            </div>
          </div>

          {/* Semester Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Step 1: Select Your Semester
              </CardTitle>
              <CardDescription>
                Choose your semester to view available books and combos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedSemester?.toString() || ''} 
                onValueChange={handleSemesterChange}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      {sem === 1 ? '1st' : sem === 2 ? '2nd' : sem === 3 ? '3rd' : `${sem}th`} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSemester && (
            <>
              {/* Book Selection */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Step 2: Select Books ({action === 'buy' ? 'to Buy' : 'to Sell'})
                  </CardTitle>
                  <CardDescription>
                    Choose individual books or select a complete semester combo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Semester Combos */}
                  {combos.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Semester Combos (Discounted)
                      </h3>
                      <div className="grid gap-4">
                        {combos.map((combo) => (
                          <Card 
                            key={combo.id} 
                            className={`cursor-pointer transition-all ${
                              selectedCombo === combo.id 
                                ? 'ring-2 ring-kiit-green bg-kiit-green/10' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => selectCombo(combo.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={selectedCombo === combo.id}
                              onCheckedChange={() => selectCombo(combo.id)}
                            />
                                    <div>
                                      <h4 className="font-semibold">{combo.combo_name}</h4>
                                      <p className="text-sm text-muted-foreground">{combo.description}</p>
                                      <Badge variant="secondary" className="mt-1">
                                        {combo.discount_percentage}% OFF
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-kiit-green">₹{combo.combo_price}</span>
                                  <p className="text-sm text-muted-foreground">Complete Set</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Separator className="my-6" />
                    </div>
                  )}

                  {/* Individual Books */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Individual Books
                    </h3>
                    
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-32 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : books.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {books.map((book) => (
                          <Card 
                            key={book.id} 
                            className={`cursor-pointer transition-all ${
                              selectedBooks.includes(book.id) 
                                ? 'ring-2 ring-kiit-green bg-kiit-green/10' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => toggleBookSelection(book.id)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <Checkbox 
                                    checked={selectedBooks.includes(book.id)}
                                    onCheckedChange={() => toggleBookSelection(book.id)}
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold line-clamp-2">{book.book_name}</h4>
                                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                                    {book.subject_category && (
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        {book.subject_category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-lg font-bold text-kiit-green">₹{book.base_price}</span>
                                  {book.publisher && (
                                    <span className="text-xs text-muted-foreground">{book.publisher}</span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No books available</h3>
                        <p className="text-muted-foreground">Books for this semester will be added soon</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cart Summary */}
              {hasSelection && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Step 3: Review Your Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedComboDetails && (
                      <div className="p-4 bg-kiit-green/10 rounded-lg border border-kiit-green/20">
                        <h4 className="font-semibold text-kiit-green mb-2">Selected Combo:</h4>
                        <p className="font-medium">{selectedComboDetails.combo_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedComboDetails.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="secondary">{selectedComboDetails.discount_percentage}% OFF</Badge>
                          <span className="font-bold text-lg">₹{selectedComboDetails.combo_price}</span>
                        </div>
                      </div>
                    )}

                    {selectedBookDetails.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Selected Books:</h4>
                        {selectedBookDetails.map((book) => (
                          <div key={book.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{book.book_name}</span>
                            <span className="font-bold">₹{book.base_price}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Separator />
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-kiit-green">₹{total}</span>
                    </div>

                    <ProtectedRoute>
                      <Button 
                        onClick={() => setShowUserForm(true)}
                        className="w-full bg-kiit-green hover:bg-kiit-green/90"
                        disabled={isSubmitting}
                      >
                        {action === 'buy' ? 'Proceed to Buy' : 'Submit for Buyback'}
                      </Button>
                    </ProtectedRoute>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* User Details Dialog */}
          <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {action === 'buy' ? 'Complete Your Order' : 'Complete Buyback Request'}
                </DialogTitle>
                <DialogDescription>
                  Please provide your details to {action === 'buy' ? 'place the order' : 'submit the buyback request'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your phone number"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">
                    {action === 'buy' ? 'Delivery Address' : 'Pickup Address'}
                  </Label>
                  <Input
                    id="address"
                    value={userDetails.address}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={action === 'buy' ? 'Where should we deliver?' : 'Where should we pickup?'}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUserForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitSelection}
                    disabled={isSubmitting || !userDetails.name || !userDetails.email || !userDetails.phone}
                    className="flex-1 bg-kiit-green hover:bg-kiit-green/90"
                  >
                    {isSubmitting ? 'Submitting...' : (action === 'buy' ? 'Place Order' : 'Submit Request')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto text-kiit-green mb-3" />
                <h3 className="font-bold text-2xl">500+</h3>
                <p className="text-muted-foreground">Students Served</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-kiit-green mb-3" />
                <h3 className="font-bold text-2xl">1000+</h3>
                <p className="text-muted-foreground">Books Available</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-kiit-green mb-3" />
                <h3 className="font-bold text-2xl">15%</h3>
                <p className="text-muted-foreground">Average Combo Savings</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default BookBuybackSell;