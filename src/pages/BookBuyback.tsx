import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { useGuestForm } from "@/hooks/useGuestForm";
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner";
import { 
  BookOpen, 
  Upload, 
  CheckCircle, 
  MapPin, 
  Star,
  ArrowRight,
  Sparkles,
  Users,
  Phone,
  Mail,
  GraduationCap,
  Package,
  Calendar as CalendarIcon,
  Gift,
  DollarSign,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBookBuyback } from "@/hooks/useBookBuyback";
import { BookSelectionGrid } from "@/components/BookSelectionGrid";
import { PricingSummary } from "@/components/PricingSummary";
import { BuyBooksSection } from "@/components/BuyBooksSection";
import { format } from "date-fns";

// Updated form schemas for new comprehensive system
const sellFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  email: z.string().email("Valid email is required"),
  branch: z.string().min(1, "Branch is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  upiId: z.string().min(1, "UPI ID is required for payment"),
  pickupDate: z.date().refine(date => date > new Date(), "Pickup date must be in the future"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms"
  })
});

type SellFormData = z.infer<typeof sellFormSchema>;

export default function BookBuyback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    formData: guestFormData,
    updateFormData: updateGuestFormData,
    resetForm: resetGuestForm
  } = useGuestForm({ 
    key: 'book-buyback',
    initialData: {} as SellFormData 
  });

  const {
    semesterBooks,
    selectedSemester,
    selectedBooks,
    isLoading,
    setSelectedSemester,
    fetchSemesterBooks,
    addBookToSelection,
    removeBookFromSelection,
    submitSellRequest,
    calculatePrice,
    getTotalEstimatedPrice,
    isFullSemesterSet,
    getBonusAmount,
    getFinalTotal
  } = useBookBuyback();

  const [pickupDate, setPickupDate] = useState<Date>();
  const [currentStep, setCurrentStep] = useState<'semester' | 'books' | 'form'>('semester');

  const sellForm = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: guestFormData
  });

  // Load semester books when semester is selected
  useEffect(() => {
    if (selectedSemester) {
      fetchSemesterBooks(selectedSemester);
      setCurrentStep('books');
    }
  }, [selectedSemester]);

  // Update guest form data when form changes
  useEffect(() => {
    const subscription = sellForm.watch((value) => {
      updateGuestFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [sellForm.watch, updateGuestFormData]);

  const handleSemesterSelect = (semester: number) => {
    setSelectedSemester(semester);
  };

  const handleProceedToForm = () => {
    if (selectedBooks.length === 0) {
      toast({
        title: "No books selected",
        description: "Please select at least one book to proceed.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('form');
  };

  const handleSellSubmit = async (data: SellFormData) => {
    if (!user) {
      // Redirect to auth for final submission
      navigate('/auth?redirect=/book-buyback');
      return;
    }

    try {
      await submitSellRequest({
        ...data,
        pickup_scheduled_at: pickupDate,
      });
      
      // Reset everything
      sellForm.reset();
      resetGuestForm();
      setSelectedSemester(null);
      setPickupDate(undefined);
      setCurrentStep('semester');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft to-background">
      <Navbar />
      
      {!user && <GuestBrowsingBanner message="You'll need to sign in before confirming your book sale" />}
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <BookOpen className="w-4 h-4" />
            Student-to-Student Book Exchange
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Give Your Books a 
            <span className="block">Second Life 📚💙</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            We'll buy your old semester books at a fair price — not by weight, but by value. 
            <span className="font-semibold text-kiit-green block mt-2">More cash for you, more savings for juniors.</span>
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-kiit-green to-campus-blue text-white">
              <Package className="w-5 h-5 mr-2" />
              Sell Your Books
            </Button>
            <Button variant="outline" size="lg">
              <BookOpen className="w-5 h-5 mr-2" />
              Buy Pre-Loved Books
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-poppins font-bold text-center text-gradient mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-kiit-green to-campus-blue p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Select Semester</h3>
                <p className="text-muted-foreground text-sm">Choose your semester to view available books</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-campus-blue to-campus-purple p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Pick Books & Condition</h3>
                <p className="text-muted-foreground text-sm">Select books and specify their condition</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-campus-purple to-campus-orange p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Get Fair Price</h3>
                <p className="text-muted-foreground text-sm">See instant pricing based on condition & demand</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-campus-orange to-kiit-green p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">4. Schedule Pickup</h3>
                <p className="text-muted-foreground text-sm">Worker verifies & pays instantly</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Book Condition Guide */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-poppins font-bold text-center text-gradient mb-12">
            Book Condition Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-green-200 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📗</div>
                <Badge className="bg-green-100 text-green-800 mb-2">Mint Condition</Badge>
                <p className="text-sm text-muted-foreground mb-2">No markings, looks new</p>
                <p className="font-semibold text-green-600">Highest Price</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📘</div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">Good Condition</Badge>
                <p className="text-sm text-muted-foreground mb-2">Few highlights, neat</p>
                <p className="font-semibold text-blue-600">Medium Price</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📙</div>
                <Badge className="bg-orange-100 text-orange-800 mb-2">Fair Condition</Badge>
                <p className="text-sm text-muted-foreground mb-2">Notes inside, still usable</p>
                <p className="font-semibold text-orange-600">Lower Price</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Interactive Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="sell" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Sell Your Books
              </TabsTrigger>
              <TabsTrigger value="buy" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Buy Pre-Loved Books
              </TabsTrigger>
            </TabsList>

            {/* Sell Books Section */}
            <TabsContent value="sell">
              <div className="max-w-7xl mx-auto">
                {/* Step 1: Semester Selection */}
                {currentStep === 'semester' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-3xl font-poppins font-bold text-gradient mb-4">
                        Which semester books do you want to sell?
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Select your semester to see all available books with instant pricing
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <Card 
                        className="glass-card cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                        onClick={() => handleSemesterSelect(1)}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="bg-gradient-to-r from-kiit-green to-campus-blue p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">1st</span>
                          </div>
                          <h4 className="text-xl font-semibold mb-2">1st Semester</h4>
                          <p className="text-muted-foreground text-sm">
                            Mathematics, Programming, Chemistry & more
                          </p>
                          <Badge className="mt-3" variant="secondary">7 Books Available</Badge>
                        </CardContent>
                      </Card>

                      <Card 
                        className="glass-card cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                        onClick={() => handleSemesterSelect(2)}
                      >
                        <CardContent className="p-8 text-center">
                          <div className="bg-gradient-to-r from-campus-blue to-campus-purple p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">2nd</span>
                          </div>
                          <h4 className="text-xl font-semibold mb-2">2nd Semester</h4>
                          <p className="text-muted-foreground text-sm">
                            Physics, C++, Mechanics & more
                          </p>
                          <Badge className="mt-3" variant="secondary">5 Books Available</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 2: Book Selection */}
                {currentStep === 'books' && selectedSemester && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-poppins font-bold text-gradient">
                            {selectedSemester === 1 ? '1st' : '2nd'} Semester Books
                          </h3>
                          <p className="text-muted-foreground">
                            Select books and their condition to see pricing
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setCurrentStep('semester')}
                        >
                          Change Semester
                        </Button>
                      </div>

                      <BookSelectionGrid
                        semesterBooks={semesterBooks}
                        selectedBooks={selectedBooks}
                        onAddBook={addBookToSelection}
                        onRemoveBook={removeBookFromSelection}
                        calculatePrice={calculatePrice}
                      />

                      {selectedBooks.length > 0 && (
                        <div className="mt-8 text-center">
                          <Button 
                            size="lg" 
                            onClick={handleProceedToForm}
                            className="bg-gradient-to-r from-kiit-green to-campus-blue text-white"
                          >
                            Proceed to Seller Details
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <PricingSummary
                        selectedBooks={selectedBooks}
                        totalEstimatedPrice={getTotalEstimatedPrice()}
                        isFullSemesterSet={isFullSemesterSet()}
                        bonusAmount={getBonusAmount()}
                        finalTotal={getFinalTotal()}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Seller Form */}
                {currentStep === 'form' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <Card className="glass-card">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-2xl font-poppins text-gradient">
                                Seller Details & Pickup
                              </CardTitle>
                              <p className="text-muted-foreground">
                                Final step - provide your details for pickup and payment
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentStep('books')}
                            >
                              Back to Books
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={sellForm.handleSubmit(handleSellSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Full Name *
                                </Label>
                                <Input 
                                  {...sellForm.register("fullName")}
                                  placeholder="Your full name"
                                />
                                {sellForm.formState.errors.fullName && (
                                  <p className="text-sm text-destructive mt-1">
                                    {sellForm.formState.errors.fullName.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="rollNumber" className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  Roll Number *
                                </Label>
                                <Input 
                                  {...sellForm.register("rollNumber")}
                                  placeholder="Your roll number"
                                />
                                {sellForm.formState.errors.rollNumber && (
                                  <p className="text-sm text-destructive mt-1">
                                    {sellForm.formState.errors.rollNumber.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="contactNumber" className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Contact Number *
                                </Label>
                                <Input 
                                  {...sellForm.register("contactNumber")}
                                  placeholder="Your contact number"
                                />
                                {sellForm.formState.errors.contactNumber && (
                                  <p className="text-sm text-destructive mt-1">
                                    {sellForm.formState.errors.contactNumber.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="email" className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email ID *
                                </Label>
                                <Input 
                                  type="email"
                                  {...sellForm.register("email")}
                                  placeholder="your.email@kiit.ac.in"
                                />
                                {sellForm.formState.errors.email && (
                                  <p className="text-sm text-destructive mt-1">
                                    {sellForm.formState.errors.email.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="branch" className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  Branch *
                                </Label>
                                <Select onValueChange={(value) => sellForm.setValue("branch", value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your branch" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                                    <SelectItem value="IT">Information Technology</SelectItem>
                                    <SelectItem value="EEE">Electrical & Electronics Engineering</SelectItem>
                                    <SelectItem value="ECE">Electronics & Communication Engineering</SelectItem>
                                    <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                                    <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                                    <SelectItem value="CHEM">Chemical Engineering</SelectItem>
                                    <SelectItem value="BBA">Bachelor of Business Administration</SelectItem>
                                    <SelectItem value="MBA">Master of Business Administration</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                {sellForm.formState.errors.branch && (
                                  <p className="text-sm text-destructive mt-1">
                                    {sellForm.formState.errors.branch.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="yearOfStudy" className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  Year of Study *
                                </Label>
                                <Select onValueChange={(value) => sellForm.setValue("yearOfStudy", value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                    <SelectItem value="PG 1st Year">PG 1st Year</SelectItem>
                                    <SelectItem value="PG 2nd Year">PG 2nd Year</SelectItem>
                                  </SelectContent>
                                </Select>
                                {sellForm.formState.errors.yearOfStudy && (
                                  <p className="text-sm text-destructive mt-1">
                                    {sellForm.formState.errors.yearOfStudy.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="pickupLocation" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Pickup Location *
                              </Label>
                              <Input 
                                {...sellForm.register("pickupLocation")}
                                placeholder="e.g., Kalinga Hostel Gate, CS Building, Campus 15"
                              />
                              {sellForm.formState.errors.pickupLocation && (
                                <p className="text-sm text-destructive mt-1">
                                  {sellForm.formState.errors.pickupLocation.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                UPI ID for Payment *
                              </Label>
                              <Input 
                                {...sellForm.register("upiId")}
                                placeholder="your-upi@bankname"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Payment will be made immediately after book verification
                              </p>
                              {sellForm.formState.errors.upiId && (
                                <p className="text-sm text-destructive mt-1">
                                  {sellForm.formState.errors.upiId.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Preferred Pickup Date *
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {pickupDate ? format(pickupDate, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={pickupDate}
                                    onSelect={setPickupDate}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {sellForm.formState.errors.pickupDate && (
                                <p className="text-sm text-destructive mt-1">
                                  {sellForm.formState.errors.pickupDate.message}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                checked={sellForm.watch("termsAccepted")}
                                onCheckedChange={(checked) => sellForm.setValue("termsAccepted", checked as boolean)}
                              />
                              <Label className="text-sm">
                                I confirm these books are original and belong to me. I agree to the terms and conditions. *
                              </Label>
                            </div>
                            {sellForm.formState.errors.termsAccepted && (
                              <p className="text-sm text-destructive">
                                {sellForm.formState.errors.termsAccepted.message}
                              </p>
                            )}

                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-kiit-green to-campus-blue text-white font-semibold py-3"
                              disabled={isLoading}
                            >
                              {isLoading ? "Submitting..." : user ? "Confirm Book Sale" : "Sign In & Confirm Sale"}
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <PricingSummary
                        selectedBooks={selectedBooks}
                        totalEstimatedPrice={getTotalEstimatedPrice()}
                        isFullSemesterSet={isFullSemesterSet()}
                        bonusAmount={getBonusAmount()}
                        finalTotal={getFinalTotal()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Buy Books Section */}
            <TabsContent value="buy">
              <BuyBooksSection />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Bonus Combos Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-kiit-green-soft to-white">
        <div className="container mx-auto text-center">
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-kiit-green" />
              <h3 className="text-2xl font-poppins font-bold text-gradient mb-4">
                Bonus Combos
              </h3>
              <p className="text-lg text-muted-foreground">
                Sell more, earn more! Bundle full semester sets for a bonus price.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety & Trust */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="glass-card max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Safety & Trust</h3>
              <p className="text-sm text-muted-foreground">
                This service is independent of KIIT University. By Students, For Students. 
                100% safe, verified books only.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}