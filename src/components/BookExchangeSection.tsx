import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, BookOpen, Users, ArrowRightLeft, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBookExchange } from '@/hooks/useBookExchange';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const exchangeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  location: z.string().min(1, 'Location is required')
});

type ExchangeFormData = z.infer<typeof exchangeSchema>;

interface Book {
  title: string;
  author: string;
  condition: string;
}

export function BookExchangeSection() {
  const { user } = useAuth();
  const {
    isLoading,
    availableExchanges,
    myExchanges,
    createExchangeProposal,
    loadMyExchanges,
    loadAvailableExchanges
  } = useBookExchange();

  const [booksToGive, setBooksToGive] = useState<Book[]>([]);
  const [booksWanted, setBooksWanted] = useState<Book[]>([]);
  const [newBookGive, setNewBookGive] = useState<Book>({ title: '', author: '', condition: 'Good' });
  const [newBookWant, setNewBookWant] = useState<Book>({ title: '', author: '', condition: 'Any' });

  const form = useForm<ExchangeFormData>({
    resolver: zodResolver(exchangeSchema)
  });

  const addBookToGive = () => {
    if (newBookGive.title && newBookGive.author) {
      setBooksToGive([...booksToGive, newBookGive]);
      setNewBookGive({ title: '', author: '', condition: 'Good' });
    }
  };

  const addBookWanted = () => {
    if (newBookWant.title && newBookWant.author) {
      setBooksWanted([...booksWanted, newBookWant]);
      setNewBookWant({ title: '', author: '', condition: 'Any' });
    }
  };

  const removeBookToGive = (index: number) => {
    setBooksToGive(booksToGive.filter((_, i) => i !== index));
  };

  const removeBookWanted = (index: number) => {
    setBooksWanted(booksWanted.filter((_, i) => i !== index));
  };

  const handleSubmitExchange = async (data: ExchangeFormData) => {
    if (booksToGive.length === 0) {
      toast.error('Please add at least one book to give');
      return;
    }

    if (booksWanted.length === 0) {
      toast.error('Please add at least one book you want');
      return;
    }

    const success = await createExchangeProposal({
      books_to_give: booksToGive,
      books_wanted: booksWanted,
      contact_info: {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        location: data.location || ''
      }
    });

    if (success) {
      form.reset();
      setBooksToGive([]);
      setBooksWanted([]);
      loadMyExchanges();
    }
  };

  React.useEffect(() => {
    if (user) {
      loadMyExchanges();
      loadAvailableExchanges();
    }
  }, [user, loadMyExchanges, loadAvailableExchanges]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-poppins font-bold text-gradient mb-4">
          📚 Book Exchange
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Exchange your books with fellow students for <span className="font-semibold text-kiit-green">FREE!</span> 
          No money involved - just pure book swapping magic.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Exchange
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Available Exchanges
          </TabsTrigger>
          <TabsTrigger value="my-exchanges" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Exchanges
          </TabsTrigger>
        </TabsList>

        {/* Create Exchange */}
        <TabsContent value="create" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-kiit-green" />
                Create Book Exchange
              </CardTitle>
              <CardDescription>
                List books you want to give and books you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Books to Give */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-kiit-green">Books I Want to Give</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Book Title</Label>
                    <Input
                      value={newBookGive.title}
                      onChange={(e) => setNewBookGive({...newBookGive, title: e.target.value})}
                      placeholder="Enter book title"
                    />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={newBookGive.author}
                      onChange={(e) => setNewBookGive({...newBookGive, author: e.target.value})}
                      placeholder="Enter author name"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addBookToGive} className="w-full">
                      Add Book
                    </Button>
                  </div>
                </div>

                {booksToGive.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {booksToGive.map((book, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 py-2 px-3">
                        <BookOpen className="w-3 h-3" />
                        {book.title} by {book.author}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeBookToGive(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Books Wanted */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-campus-blue">Books I Want to Receive</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Book Title</Label>
                    <Input
                      value={newBookWant.title}
                      onChange={(e) => setNewBookWant({...newBookWant, title: e.target.value})}
                      placeholder="Enter book title"
                    />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={newBookWant.author}
                      onChange={(e) => setNewBookWant({...newBookWant, author: e.target.value})}
                      placeholder="Enter author name"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addBookWanted} variant="outline" className="w-full">
                      Add Book
                    </Button>
                  </div>
                </div>

                {booksWanted.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {booksWanted.map((book, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-2 py-2 px-3">
                        <BookOpen className="w-3 h-3" />
                        {book.title} by {book.author}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeBookWanted(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <form onSubmit={form.handleSubmit(handleSubmitExchange)} className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input {...form.register('name')} placeholder="Your full name" />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input {...form.register('phone')} placeholder="Your phone number" />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input {...form.register('email')} type="email" placeholder="Your email" />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input {...form.register('location')} placeholder="Hostel/Campus location" />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-600">{form.formState.errors.location.message}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || booksToGive.length === 0 || booksWanted.length === 0}
                  className="w-full bg-gradient-to-r from-kiit-green to-campus-blue text-white"
                >
                  Create Free Exchange
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Exchanges */}
        <TabsContent value="available" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Available Book Exchanges</CardTitle>
              <CardDescription>
                Find exchanges that match your interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableExchanges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No available exchanges at the moment</p>
                  <p className="text-sm">Be the first to create one!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableExchanges.map((exchange) => (
                    <div key={exchange.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary">Available</Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-kiit-green mb-2">Books Offered:</h4>
                          <div className="space-y-1">
                            {exchange.user1_books.map((book: any, idx: number) => (
                              <p key={idx} className="text-sm">• {book.title} by {book.author}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-campus-blue mb-2">Books Wanted:</h4>
                          <div className="space-y-1">
                            {exchange.user1_wants.map((book: any, idx: number) => (
                              <p key={idx} className="text-sm">• {book.title} by {book.author}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Exchanges */}
        <TabsContent value="my-exchanges" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>My Book Exchanges</CardTitle>
              <CardDescription>
                Track your exchange proposals and active exchanges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myExchanges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't created any exchanges yet</p>
                  <p className="text-sm">Create your first exchange to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myExchanges.map((exchange) => (
                    <div key={exchange.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge 
                          variant={exchange.status === 'completed' ? 'default' : 'secondary'}
                          className={exchange.status === 'completed' ? 'bg-green-500' : ''}
                        >
                          {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exchange.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-kiit-green mb-2">Your Books:</h4>
                          <div className="space-y-1">
                            {exchange.user1_books.map((book: any, idx: number) => (
                              <p key={idx} className="text-sm">• {book.title} by {book.author}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-campus-blue mb-2">Books You Want:</h4>
                          <div className="space-y-1">
                            {exchange.user1_wants.map((book: any, idx: number) => (
                              <p key={idx} className="text-sm">• {book.title} by {book.author}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Free Exchange Notice */}
      <Card className="border-2 border-kiit-green/20 bg-kiit-green/5">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-kiit-green">100% Free Book Exchange 🆓</h3>
            <p className="text-muted-foreground">
              No commission, no fees, no money involved. Just students helping students get the books they need!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}