import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Camera, Users, Star, CheckCircle, Info, Car, ArrowRight, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-campus.png";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuestBrowsingBanner } from "@/components/services/book-buy-sell/GuestBrowsingBanner";
import { useGuestForm } from "@/hooks/useGuestForm";
import { useAuth } from "@/hooks/useAuth";
import { useCampusTourBooking } from "@/hooks/useCampusTourBooking";

export default function CampusTourBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    formData,
    updateFormData,
    resetForm,
    requireAuth,
    isAuthenticated
  } = useGuestForm({
    key: 'campusTour',
    initialData: {
      selectedDate: null as Date | null,
      selectedSlot: '',
      guestName: '',
      contactNumber: '',
      email: '',
      groupSize: 1,
      specialRequests: '',
      tourType: 'morning' as 'morning' | 'evening'
    },
    onAuthenticated: (data) => {
      handleBookingSubmission(data);
    }
  });

  const { submitBooking, calculatePrice, isSubmitting } = useCampusTourBooking();

  const handleBookingSubmission = async (data = formData) => {
    try {
      await submitBooking({
        guestName: data.guestName,
        contactNumber: data.contactNumber,
        email: data.email,
        selectedDate: data.selectedDate,
        selectedSlot: data.selectedSlot,
        groupSize: data.groupSize,
        specialRequests: data.specialRequests,
        tourType: data.tourType
      });
      resetForm();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.selectedDate || !formData.selectedSlot || !formData.guestName || !formData.contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Require authentication before final booking
    requireAuth(() => handleBookingSubmission());
  };

  const morningItinerary = [
    {
      time: "10:00 AM",
      phase: "Academic Core",
      activity: "Central Library & Learning Hub",
      description: "Explore KIIT's crown jewel - 5-floor library with digital resources",
      photoTip: "Perfect morning light through glass facade"
    },
    {
      time: "10:30 AM", 
      phase: "Academic Core",
      activity: "School of Computer Engineering",
      description: "State-of-the-art labs and innovation centers",
      photoTip: "Capture the modern architecture"
    },
    {
      time: "11:15 AM",
      phase: "Iconic Spots", 
      activity: "KIIT Rose Garden & Sculpture Park",
      description: "Beautiful landscaped gardens with artistic installations",
      photoTip: "Golden morning light on roses - ideal for family photos"
    },
    {
      time: "12:00 PM",
      phase: "Sports & Student Life",
      activity: "KIIT Stadium & Sports Complex",
      description: "Olympic-standard facilities and student recreation areas",
      photoTip: "Panoramic stadium shots"
    },
    {
      time: "12:45 PM",
      phase: "Cultural Experience",
      activity: "Student Activity Center",
      description: "Hub of cultural events and student societies",
      photoTip: "Vibrant student artwork and displays"
    },
    {
      time: "1:30 PM",
      phase: "Campus Life",
      activity: "Food Courts & Campus Retail",
      description: "Experience student dining and campus life",
      photoTip: "Authentic campus lifestyle shots"
    }
  ];

  const eveningItinerary = [
    {
      time: "2:00 PM",
      phase: "Academic Excellence",
      activity: "Engineering & Research Blocks",
      description: "Tour cutting-edge research facilities and labs",
      photoTip: "Afternoon light highlighting modern architecture"
    },
    {
      time: "2:45 PM",
      phase: "Academic Excellence", 
      activity: "KIIT Technology Business Incubator",
      description: "Where student innovations become businesses",
      photoTip: "Dynamic startup environment"
    },
    {
      time: "3:30 PM",
      phase: "Cultural Immersion",
      activity: "Traditional Arts & Culture Center",
      description: "Odisha's heritage meets modern education",
      photoTip: "Beautiful traditional architecture details"
    },
    {
      time: "4:15 PM",
      phase: "Cultural Immersion",
      activity: "International Student Hub",
      description: "Global community and multicultural spaces",
      photoTip: "Diverse student interactions"
    },
    {
      time: "5:00 PM",
      phase: "Evening Magic",
      activity: "KIIT Main Entrance & Heritage Wall",
      description: "Iconic entrance with KIIT's story and achievements",
      photoTip: "Golden hour lighting - perfect for entrance shots"
    },
    {
      time: "6:00 PM",
      phase: "Evening Magic",
      activity: "Campus Illumination & Night Views",
      description: "See KIIT transform as lights come alive",
      photoTip: "Stunning twilight and night photography"
    }
  ];

  const faqs = [
    {
      question: "Can we customize the tour stops?",
      answer: "Yes! While we follow our planned itinerary, we can adjust stops based on your specific interests within the time limits. Just mention your preferences in the special requests."
    },
    {
      question: "Is the tour child-friendly?",
      answer: "Absolutely! We include comfort breaks, keep walking to a minimum, and our guides are experienced with families. The tour is designed to be engaging for all ages."
    },
    {
      question: "What languages are guides available in?",
      answer: "Our experienced driver-guides are fluent in English, Hindi, and Odia. They're all KIIT alumni or current students with deep campus knowledge."
    },
    {
      question: "What's included in the tour cost?",
      answer: "The cost covers private auto/cab transportation, experienced driver-guide, campus entry coordination, and photography assistance. Meals and snacks are additional."
    },
    {
      question: "How do we get campus entry?",
      answer: "Once you book, we'll coordinate with KIIT security and send you a visitor pass via WhatsApp. You'll need to show this at the main gate along with ID proof."
    },
    {
      question: "What's the weather like and what should we bring?",
      answer: "Bhubaneswar has tropical weather. Bring water bottles, comfortable walking shoes, camera, and sun protection. We recommend light cotton clothing."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="KIIT Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Explore KIIT Your Way
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90">
            Private Campus Tours for Families
          </p>
          <p className="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto">
            Two exclusive half-day tours – Morning & Evening – designed for parents to experience KIIT's excellence, culture, and beauty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}>
              Book Your Tour
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' })}>
              View Tour Itinerary
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Missed the Official Campus Tour?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Don't worry! We've created these exclusive private tours specifically for parents and families who couldn't join the original bus tour. Choose your ideal time and discover KIIT's academic brilliance, cultural vibrancy, and world-class facilities in complete comfort.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Private Ride</h3>
                <p className="text-sm text-muted-foreground">Comfortable auto or cab</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Expert Guide</h3>
                <p className="text-sm text-muted-foreground">KIIT alumni drivers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Photo Spots</h3>
                <p className="text-sm text-muted-foreground">Best lighting tips</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Cultural Experience</h3>
                <p className="text-sm text-muted-foreground">Local insights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Options Overview */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Choose Your Perfect Time
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Morning Tour Card */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <div className="relative h-48 bg-gradient-to-br from-yellow-400/20 to-orange-400/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sun className="w-16 h-16 text-yellow-600" />
                </div>
                <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-900">
                  Morning Tour
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  10:00 AM – 2:00 PM
                </CardTitle>
                <CardDescription className="text-lg font-medium text-foreground">
                  Optimized Academic & Scenic Highlights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Perfect morning light for photography
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Focus on academic facilities & libraries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Beautiful rose garden & campus landscapes
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Full Itinerary <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Evening Tour Card */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <div className="relative h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Moon className="w-16 h-16 text-purple-600" />
                </div>
                <Badge className="absolute top-4 left-4 bg-purple-500 text-purple-900">
                  Evening Tour
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  2:00 PM – 7:00 PM
                </CardTitle>
                <CardDescription className="text-lg font-medium text-foreground">
                  Golden Hour & Cultural Magic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Stunning golden hour & twilight photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Cultural centers & heritage experiences
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Campus illumination & night views
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Full Itinerary <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Itineraries */}
      <section id="itinerary" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Detailed Tour Itineraries
          </h2>
          
          <Tabs defaultValue="morning" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="morning" className="text-lg">Morning Tour</TabsTrigger>
              <TabsTrigger value="evening" className="text-lg">Evening Tour</TabsTrigger>
            </TabsList>
            
            <TabsContent value="morning">
              <div className="space-y-6">
                {morningItinerary.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-32 flex-shrink-0">
                          <Badge variant="outline" className="text-sm font-medium">
                            {item.time}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.phase}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {item.activity}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Camera className="w-4 h-4" />
                            <span className="italic">{item.photoTip}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="evening">
              <div className="space-y-6">
                {eveningItinerary.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-32 flex-shrink-0">
                          <Badge variant="outline" className="text-sm font-medium">
                            {item.time}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.phase}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {item.activity}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Camera className="w-4 h-4" />
                            <span className="italic">{item.photoTip}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Tour Comparison Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Compare Tour Options
          </h2>
          
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-background rounded-lg shadow-sm border">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold text-yellow-700">Morning Tour</th>
                  <th className="text-center p-4 font-semibold text-purple-700">Evening Tour</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Timing</td>
                  <td className="p-4 text-center">10:00 AM – 2:00 PM</td>
                  <td className="p-4 text-center">2:00 PM – 7:00 PM</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Main Focus</td>
                  <td className="p-4 text-center">Academic facilities & gardens</td>
                  <td className="p-4 text-center">Culture & heritage</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Photography</td>
                  <td className="p-4 text-center">Bright morning light</td>
                  <td className="p-4 text-center">Golden hour & twilight</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Cultural Elements</td>
                  <td className="p-4 text-center">Student activity center</td>
                  <td className="p-4 text-center">Arts center & heritage</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Cost & Duration</td>
                  <td className="p-4 text-center">₹600-800 • 4 hours</td>
                  <td className="p-4 text-center">₹700-900 • 5 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <GuestBrowsingBanner 
              message="Explore tour options and prepare your booking"
              action="sign in to confirm your campus tour"
              className="mb-6"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Book Your Campus Tour
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Tour Booking Form</CardTitle>
                <CardDescription>
                  {isAuthenticated 
                    ? "Complete your booking details and we'll call you within 12 hours to confirm."
                    : "Fill in your details, then sign in to complete your booking."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        required 
                        placeholder="Enter your full name"
                        value={formData.guestName}
                        onChange={(e) => updateFormData({guestName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => updateFormData({email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      required 
                      placeholder="Enter your phone number"
                      value={formData.contactNumber}
                      onChange={(e) => updateFormData({contactNumber: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.selectedDate ? format(formData.selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.selectedDate}
                            onSelect={(date) => updateFormData({selectedDate: date})}
                            disabled={(date) => date < new Date(Date.now() + 24 * 60 * 60 * 1000)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Tour Slot *</Label>
                      <Select 
                        value={formData.selectedSlot}
                        onValueChange={(value) => updateFormData({selectedSlot: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tour time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (10:00 AM - 2:00 PM)</SelectItem>
                          <SelectItem value="evening">Evening (2:00 PM - 7:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="groupSize">Group Size</Label>
                    <Select 
                      value={formData.groupSize.toString()}
                      onValueChange={(value) => updateFormData({groupSize: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Person</SelectItem>
                        <SelectItem value="2">2 People</SelectItem>
                        <SelectItem value="3">3 People</SelectItem>
                        <SelectItem value="4">4 People</SelectItem>
                        <SelectItem value="5">5+ People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="requests">Special Requests</Label>
                    <Textarea 
                      id="requests" 
                      placeholder="Any specific places you'd like to visit or special requirements..."
                      className="min-h-[100px]"
                      value={formData.specialRequests}
                      onChange={(e) => updateFormData({specialRequests: e.target.value})}
                    />
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Info className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Cost Information</h4>
                        <p className="text-sm text-muted-foreground">
                          Autos: ₹600–800 | Cabs: ₹700–900<br />
                          Lunch/snacks are additional
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    {isAuthenticated ? "Submit Booking Request" : "Sign In & Submit Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visitor Tips Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Visitor Tips & Guidelines
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  What to Bring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Camera or smartphone for photos</li>
                  <li>• Water bottles (especially in summer)</li>
                  <li>• Comfortable walking shoes</li>
                  <li>• ID proof for entry</li>
                  <li>• Sun protection (hat, sunglasses)</li>
                  <li>• Light snacks for energy</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  Weather Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Summer:</strong> Light cotton clothes, lots of water</li>
                  <li>• <strong>Monsoon:</strong> Umbrella, waterproof bags</li>
                  <li>• <strong>Winter:</strong> Light jacket for morning/evening</li>
                  <li>• Bhubaneswar is generally warm & humid</li>
                  <li>• Best months: Oct-Mar</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Campus entry is free with visitor pass</li>
                  <li>• Registration required 24 hours before</li>
                  <li>• Tours available 7 days a week</li>
                  <li>• Photography allowed in most areas</li>
                  <li>• Student interaction opportunities</li>
                  <li>• Multiple language support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose This Tour */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Why Choose Our Private Tours?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <strong>Private & Comfortable:</strong> No rushing with large groups, travel at your own pace
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <strong>Photography-Focused:</strong> Our guides know the best spots and lighting for memorable photos
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <strong>Cultural Immersion:</strong> Experience KIIT's unique blend of modern education and Odishan heritage
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <strong>Flexible Customization:</strong> Adjust stops based on your family's interests and energy levels
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-white/50 p-6 rounded-lg border-l-4 border-primary">
                <blockquote className="text-lg italic mb-4">
                  "The evening tour was absolutely magical! Our guide was so knowledgeable and patient with our questions. The golden hour photos at the main entrance are now our family treasures. Worth every rupee!"
                </blockquote>
                <cite className="text-sm font-semibold text-muted-foreground">
                  - Priya Sharma, Parent of CSE student
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Book Your Campus Tour Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Create lasting memories of your family's KIIT experience. Choose your perfect time and discover why KIIT is special.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-12 py-4"
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Your Booking
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}