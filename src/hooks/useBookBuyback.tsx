import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SemesterBook {
  id: string;
  semester: number;
  book_name: string;
  author: string;
  edition: string;
  publisher: string;
  base_price: number;
  demand_multiplier: number;
}

export interface BookCondition {
  value: 'mint' | 'good' | 'fair';
  label: string;
  emoji: string;
  multiplier: number;
  description: string;
}

export interface SelectedBook extends SemesterBook {
  condition: BookCondition['value'];
  estimated_price: number;
}

export const bookConditions: BookCondition[] = [
  {
    value: 'mint',
    label: 'Mint Condition',
    emoji: '📗',
    multiplier: 1.0,
    description: 'No markings, looks new'
  },
  {
    value: 'good',
    label: 'Good Condition',
    emoji: '📘',
    multiplier: 0.8,
    description: 'Few highlights, neat'
  },
  {
    value: 'fair',
    label: 'Fair Condition',
    emoji: '📙',
    multiplier: 0.6,
    description: 'Notes inside, still usable'
  }
];

export function useBookBuyback() {
  const [semesterBooks, setSemesterBooks] = useState<SemesterBook[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<SelectedBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch semester books
  const fetchSemesterBooks = async (semester: number) => {
    try {
      const { data, error } = await supabase
        .from('semester_books')
        .select('*')
        .eq('semester', semester)
        .order('book_name');

      if (error) throw error;
      setSemesterBooks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load semester books",
        variant: "destructive"
      });
    }
  };

  // Calculate price for a book based on condition
  const calculatePrice = (book: SemesterBook, condition: BookCondition['value']) => {
    const conditionData = bookConditions.find(c => c.value === condition);
    if (!conditionData) return 0;
    
    return Math.round(book.base_price * book.demand_multiplier * conditionData.multiplier);
  };

  // Add book to selection
  const addBookToSelection = (book: SemesterBook, condition: BookCondition['value']) => {
    const estimated_price = calculatePrice(book, condition);
    const selectedBook: SelectedBook = {
      ...book,
      condition,
      estimated_price
    };

    setSelectedBooks(prev => {
      const existing = prev.find(b => b.id === book.id);
      if (existing) {
        return prev.map(b => b.id === book.id ? selectedBook : b);
      }
      return [...prev, selectedBook];
    });
  };

  // Remove book from selection
  const removeBookFromSelection = (bookId: string) => {
    setSelectedBooks(prev => prev.filter(b => b.id !== bookId));
  };

  // Calculate total estimated price
  const getTotalEstimatedPrice = () => {
    return selectedBooks.reduce((total, book) => total + book.estimated_price, 0);
  };

  // Check if full semester set (bonus eligibility)
  const isFullSemesterSet = () => {
    return selectedBooks.length === semesterBooks.length && semesterBooks.length > 0;
  };

  // Calculate bonus amount (10% for full set)
  const getBonusAmount = () => {
    return isFullSemesterSet() ? Math.round(getTotalEstimatedPrice() * 0.1) : 0;
  };

  // Get final total with bonus
  const getFinalTotal = () => {
    return getTotalEstimatedPrice() + getBonusAmount();
  };

  // Submit book selling request
  const submitSellRequest = async (formData: any) => {
    setIsLoading(true);
    try {
      // Get book titles and conditions for required fields
      const bookTitles = selectedBooks.map(book => book.book_name).join(', ');
      const bookConditions = [...new Set(selectedBooks.map(book => book.condition))].join(', ');
      
      const submissionData = {
        // Map form fields to database columns
        full_name: formData.fullName,
        roll_number: formData.rollNumber,
        contact_number: formData.contactNumber,
        email: formData.email,
        pickup_location: formData.pickupLocation,
        upi_id: formData.upiId,
        terms_accepted: formData.termsAccepted,
        
        // Required fields derived from book selection and form
        book_titles: bookTitles,
        book_condition: bookConditions,
        branch: formData.branch,
        year_of_study: formData.yearOfStudy,
        
        // Book data
        semester: selectedSemester,
        selected_books: JSON.parse(JSON.stringify(selectedBooks)), // Convert to plain object for JSON storage
        total_estimated_price: getTotalEstimatedPrice(),
        bonus_applicable: isFullSemesterSet(),
        bonus_amount: getBonusAmount(),
        
        // User ID
        user_id: (await supabase.auth.getUser()).data.user?.id,
        
        // Default status
        status: 'pending'
      };

      console.log('Submitting book request:', submissionData);

      const { data, error } = await supabase
        .from('book_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insertion error:', error);
        throw error;
      }

      toast({
        title: "Success! 🎉",
        description: "Your book submission has been received. Our team will contact you within 24 hours to schedule pickup.",
      });

      // Reset form
      setSelectedBooks([]);
      setSelectedSemester(null);
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available books for buying
  const fetchAvailableBooks = async (filters: any = {}) => {
    console.log('fetchAvailableBooks called with filters:', filters);
    try {
      let query = supabase
        .from('book_inventory')
        .select(`
          *,
          semester_book:semester_books(*)
        `)
        .eq('status', 'available');

      if (filters.semester) {
        query = query.eq('semester_book.semester', filters.semester);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.minPrice && filters.maxPrice) {
        query = query.gte('selling_price', filters.minPrice)
                     .lte('selling_price', filters.maxPrice);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
        throw error;
      }
      
      console.log('Fetched books:', data);
      return data || [];
    } catch (error: any) {
      console.error('Error in fetchAvailableBooks:', error);
      toast({
        title: "Error",
        description: "Failed to load available books",
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    // State
    semesterBooks,
    selectedSemester,
    selectedBooks,
    isLoading,

    // Actions
    setSelectedSemester,
    fetchSemesterBooks,
    addBookToSelection,
    removeBookFromSelection,
    submitSellRequest,
    fetchAvailableBooks,

    // Calculations
    calculatePrice,
    getTotalEstimatedPrice,
    isFullSemesterSet,
    getBonusAmount,
    getFinalTotal,

    // Constants
    bookConditions
  };
}