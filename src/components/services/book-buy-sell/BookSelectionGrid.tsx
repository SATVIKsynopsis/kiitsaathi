import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, BookOpen, Trash2, DollarSign } from 'lucide-react';
import { SemesterBook, SelectedBook, bookConditions, useBookBuyback } from '@/hooks/useBookBuyback';

interface BookSelectionGridProps {
  semesterBooks: SemesterBook[];
  selectedBooks: SelectedBook[];
  onAddBook: (book: SemesterBook, condition: 'mint' | 'good' | 'fair') => void;
  onRemoveBook: (bookId: string) => void;
  calculatePrice: (book: SemesterBook, condition: 'mint' | 'good' | 'fair') => number;
}

export function BookSelectionGrid({
  semesterBooks,
  selectedBooks,
  onAddBook,
  onRemoveBook,
  calculatePrice
}: BookSelectionGridProps) {
  const [selectedConditions, setSelectedConditions] = useState<Record<string, 'mint' | 'good' | 'fair'>>({});

  const handleConditionChange = (bookId: string, condition: 'mint' | 'good' | 'fair') => {
    setSelectedConditions(prev => ({ ...prev, [bookId]: condition }));
    const book = semesterBooks.find(b => b.id === bookId);
    if (book) {
      onAddBook(book, condition);
    }
  };

  const isBookSelected = (bookId: string) => {
    return selectedBooks.some(b => b.id === bookId);
  };

  const getSelectedBook = (bookId: string) => {
    return selectedBooks.find(b => b.id === bookId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-poppins font-bold text-gradient mb-2">
          Select Your Books
        </h3>
        <p className="text-muted-foreground">
          Choose the books you want to sell and their condition
        </p>
      </div>

      <div className="grid gap-4">
        {semesterBooks.map((book) => {
          const selectedBook = getSelectedBook(book.id);
          const isSelected = isBookSelected(book.id);
          
          return (
            <Card key={book.id} className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-kiit-green shadow-lg' : 'hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${isSelected ? 'bg-kiit-green' : 'bg-muted'}`}>
                      <BookOpen className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg leading-tight">
                        {book.book_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        by {book.author} • {book.edition}
                      </p>
                      {book.publisher && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {book.publisher}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Base: ₹{book.base_price}
                      </Badge>
                      {book.demand_multiplier !== 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {book.demand_multiplier > 1 ? '🔥 High Demand' : '📉 Lower Demand'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Select
                        value={selectedBook?.condition || ''}
                        onValueChange={(value: 'mint' | 'good' | 'fair') => handleConditionChange(book.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookConditions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              <div className="flex items-center gap-2">
                                <span>{condition.emoji}</span>
                                <span>{condition.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  (₹{calculatePrice(book, condition.value)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {isSelected && selectedBook && (
                        <>
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              ₹{selectedBook.estimated_price}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveBook(book.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {isSelected && selectedBook && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="w-4 h-4" />
                        <span>Added to selling list</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {semesterBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No books found
          </h3>
          <p className="text-muted-foreground">
            Please select a semester to view available books.
          </p>
        </div>
      )}
    </div>
  );
}