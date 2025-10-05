import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Package, Users, Truck, Clock, CheckCircle, MessageCircle, Phone, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GuestBrowsingBanner } from '@/components/GuestBrowsingBanner';
import { useGuestForm } from '@/hooks/useGuestForm';
import { useAuth } from '@/hooks/useAuth';

const CartonTransfer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    formData,
    updateFormData,
    resetForm,
    requireAuth,
    isAuthenticated
  } = useGuestForm({
    key: 'cartonTransfer',
    initialData: {
      fullName: '',
      mobileNumber: '',
      hostelName: '',
      roomNumber: '',
      numberOfBoxes: 1,
      needTape: false,
      pickupSlot: '',
      paymentMethod: 'upi'
    },
    onAuthenticated: (data) => {
      // When user logs in, proceed with booking
      handleBookingSubmission(data);
    }
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // KIIT hostels list
  const hostels = [
    'Hostel 1', 'Hostel 2', 'Hostel 3', 'Hostel 4', 'Hostel 5',
    'Hostel 6', 'Hostel 7', 'Hostel 8', 'Hostel 9', 'Hostel 10',
    'Hostel 11', 'Hostel 12', 'Hostel 13', 'Hostel 14', 'Hostel 15',
    'Hostel 16', 'Hostel 17', 'Hostel 18', 'Hostel 19', 'Hostel 20'
  ];

  const timeSlots = [
    '10:00–11:00 AM',
    '12:00–1:00 PM',
    '3:00–4:00 PM',
    '5:00–6:00 PM'
  ];

  // Live price calculation
  useEffect(() => {
    let price = 0;
    
    // Box pricing with combo logic
    if (formData.numberOfBoxes === 3) {
      price += 110; // Special combo price
    } else {
      price += formData.numberOfBoxes * 40; // Regular pricing
    }
    
    // Tape cost
    if (formData.needTape) {
      price += 15;
    }
    
    // Pickup service flat rate
    price += 49;
    
    setTotalPrice(price);
  }, [formData.numberOfBoxes, formData.needTape]);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    if (!formData.hostelName) {
      toast.error('Please select your hostel');
      return false;
    }
    
    if (!formData.roomNumber.trim()) {
      toast.error('Please enter your room number');
      return false;
    }
    
    if (!formData.pickupSlot) {
      toast.error('Please select a pickup time slot');
      return false;
    }
    
    return true;
  };

  const handleBookingSubmission = async (data = formData) => {
    setIsBooking(true);
    
    try {
      // Submit to edge function
      const { data: result, error } = await supabase.functions.invoke('submit-carton-booking', {
        body: {
          fullName: data.fullName,
          mobileNumber: data.mobileNumber,
          hostelName: data.hostelName,
          roomNumber: data.roomNumber,
          numberOfBoxes: data.numberOfBoxes,
          needTape: data.needTape,
          pickupSlot: data.pickupSlot,
          paymentMethod: data.paymentMethod,
          totalPrice: totalPrice
        }
      });

      if (error) {
        throw error;
      }

      setBookingSuccess(true);
      resetForm();
      toast.success('🎉 Booking confirmed! Check your WhatsApp for details.');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Require authentication before final booking
    requireAuth(() => handleBookingSubmission());
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center glassmorphism animate-scale-in">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-kiit-green mx-auto mb-4 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Truck className="w-8 h-8 text-campus-orange animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-kiit-green mb-2">🎉 Booking Confirmed!</h2>
              <div className="bg-kiit-green/10 p-4 rounded-lg mb-4">
                <p className="font-semibold text-kiit-green">Total: ₹{totalPrice}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.numberOfBoxes} box{formData.numberOfBoxes > 1 ? 'es' : ''} • 
                  {formData.needTape ? ' Tape included • ' : ' '}
                  {formData.pickupSlot}
                </p>
              </div>
              <p className="text-muted-foreground mb-4">
                📦 <strong>Free delivery of empty boxes in the morning!</strong>
              </p>
              <p className="text-muted-foreground">
                Our team will WhatsApp you confirmation details and call 15 minutes before pickup at <strong>{formData.pickupSlot}</strong>
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => setBookingSuccess(false)} className="w-full">
                Book Another Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in">
            📦 Hostel Carton Box & Transfer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            Moving hostels? We deliver the boxes, you pack, and we move everything safely!
          </p>
          <div className="mb-8 animate-scale-in">
            <div className="bg-gradient-to-r from-kiit-green/20 to-campus-blue/20 p-8 rounded-2xl border-2 border-kiit-green/30">
              <Truck className="w-20 h-20 mx-auto text-kiit-green mb-4" />
              <p className="text-lg font-semibold text-kiit-green">Professional Hostel Moving Service</p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
            onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            📦 Book Boxes Now!
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-12">
          How It Works ✨
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: <Package className="w-12 h-12 text-kiit-green" />,
              title: "📦 You Book Boxes",
              description: "Select how many cartons you need + tape. We deliver them FREE in the morning.",
              highlight: "FREE DELIVERY"
            },
            {
              icon: <Users className="w-12 h-12 text-campus-blue" />,
              title: "🎒 You Pack Your Stuff",
              description: "You do the packing, we stay out (hostel rules!). Pack at your own pace.",
              highlight: "YOUR PRIVACY"
            },
            {
              icon: <Truck className="w-12 h-12 text-campus-orange" />,
              title: "🚚 We Pick & Shift",
              description: "Our truck comes during your slot and moves your items to the new hostel safely.",
              highlight: "SAFE TRANSPORT"
            }
          ].map((step, index) => (
            <Card key={index} className="text-center glassmorphism hover:scale-105 transition-transform duration-300 border-2 border-transparent hover:border-kiit-green/30">
              <CardContent className="p-8">
                <div className="mb-4 flex justify-center">{step.icon}</div>
                <Badge className="mb-3 bg-kiit-green/20 text-kiit-green">{step.highlight}</Badge>
                <h3 className="text-xl font-semibold mb-4 text-kiit-green">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-12">
          Simple Pricing 💸
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
          {[
            { item: "1 Box", price: "₹40", popular: false, description: "Perfect for light packers" },
            { item: "3 Boxes Combo", price: "₹110", popular: true, description: "Save ₹10! Most popular" },
            { item: "Tape (optional)", price: "₹15", popular: false, description: "Strong packing tape" },
            { item: "Pickup Service", price: "₹49 flat", popular: false, description: "Door-to-door service" }
          ].map((pricing, index) => (
            <Card key={index} className={`glassmorphism text-center transition-all duration-300 hover:scale-105 ${pricing.popular ? 'ring-2 ring-kiit-green scale-105' : ''}`}>
              <CardContent className="p-6">
                {pricing.popular && (
                  <div className="mb-4">
                    <Badge className="bg-kiit-green text-white animate-pulse">Most Popular</Badge>
                    <div className="flex justify-center mt-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{pricing.item}</h3>
                <p className="text-2xl font-bold text-kiit-green mb-2">{pricing.price}</p>
                <p className="text-xs text-muted-foreground">{pricing.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <div className="bg-kiit-green/10 p-4 rounded-lg inline-block">
            <p className="text-kiit-green font-semibold">
              ✨ Free delivery of empty boxes in the morning!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              No extra charges for box delivery • Save time and energy
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking-form" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <GuestBrowsingBanner 
            message="Fill out the form below to prepare your booking"
            action="sign in to confirm your carton transfer"
            className="mb-6"
          />
          <Card className="glassmorphism shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-kiit-green">📋 Book Your Carton Transfer</CardTitle>
              <CardDescription className="text-lg">
                {isAuthenticated ? 'Complete your booking below' : 'Fill out the form, then sign in to complete'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-6">
                {/* Personal Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-base font-semibold">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateFormData({fullName: e.target.value})}
                      placeholder="Enter your full name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobileNumber" className="text-base font-semibold">Mobile Number (10 digits) *</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        updateFormData({mobileNumber: value});
                      }}
                      placeholder="9876543210"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Hostel Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hostelName" className="text-base font-semibold">Hostel Name *</Label>
                    <Select value={formData.hostelName} onValueChange={(value) => updateFormData({hostelName: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((hostel) => (
                          <SelectItem key={hostel} value={hostel}>{hostel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="roomNumber" className="text-base font-semibold">Room Number *</Label>
                    <Input
                      id="roomNumber"
                      required
                      value={formData.roomNumber}
                      onChange={(e) => updateFormData({roomNumber: e.target.value})}
                      placeholder="e.g., 205"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Box Selection */}
                <div>
                  <Label className="text-base font-semibold">Number of Boxes *</Label>
                  <Select value={formData.numberOfBoxes.toString()} onValueChange={(value) => updateFormData({numberOfBoxes: parseInt(value)})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Box (₹40)</SelectItem>
                      <SelectItem value="2">2 Boxes (₹80)</SelectItem>
                      <SelectItem value="3">3 Boxes Combo (₹110) - Save ₹10!</SelectItem>
                      <SelectItem value="4">4 Boxes (₹160)</SelectItem>
                      <SelectItem value="5">5 Boxes (₹200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tape Option */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="needTape" className="text-base font-semibold">Need Tape? (+₹15)</Label>
                    <p className="text-sm text-muted-foreground">Strong packing tape for secure boxes</p>
                  </div>
                  <Switch
                    id="needTape"
                    checked={formData.needTape}
                    onCheckedChange={(checked) => updateFormData({needTape: checked})}
                  />
                </div>

                {/* Pickup Slot */}
                <div>
                  <Label className="text-base font-semibold">Preferred Pickup Slot *</Label>
                  <Select value={formData.pickupSlot} onValueChange={(value) => updateFormData({pickupSlot: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose your pickup time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {slot}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="text-base font-semibold">Payment Method *</Label>
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => updateFormData({paymentMethod: value})}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi">UPI Payment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pod" id="pod" />
                      <Label htmlFor="pod">Pay on Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Live Total Calculation */}
                <div className="bg-gradient-to-r from-kiit-green/10 to-campus-blue/10 p-6 rounded-lg border-2 border-kiit-green/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Live Total:</span>
                    <span className="text-3xl font-bold text-kiit-green">₹{totalPrice}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{formData.numberOfBoxes} box{formData.numberOfBoxes > 1 ? 'es' : ''}</span>
                      <span>₹{formData.numberOfBoxes === 3 ? 110 : formData.numberOfBoxes * 40}</span>
                    </div>
                    {formData.needTape && (
                      <div className="flex justify-between">
                        <span>Tape</span>
                        <span>₹15</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Pickup service</span>
                      <span>₹49</span>
                    </div>
                    <hr className="border-kiit-green/20" />
                    <div className="flex justify-between font-semibold text-kiit-green">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                  <p className="text-xs text-center mt-3 text-muted-foreground">
                    ✨ Includes FREE morning delivery of empty boxes
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Booking...
                    </div>
                  ) : (
                    '🚀 Confirm Booking'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-12">
          Frequently Asked Questions 🙋
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "Can your team help me pack?",
                answer: "Nope! Hostel rules don't allow helpers inside. You pack, we move. This ensures your privacy and follows hostel regulations."
              },
              {
                question: "Can I get boxes today and shift tomorrow?",
                answer: "Yes! We deliver boxes FREE in the morning and shift at your booked time slot. Perfect for planning ahead."
              },
              {
                question: "Will someone call me before pickup?",
                answer: "Absolutely! Our team will call/WhatsApp you 15 minutes before your scheduled slot so you're ready."
              },
              {
                question: "What if I need more boxes later?",
                answer: "Just book again using this page. We'll deliver the extra boxes and can coordinate with your existing booking."
              },
              {
                question: "Is this service available on weekends?",
                answer: "Yes! We operate 7 days a week, including weekends and holidays. Student convenience is our priority."
              },
              {
                question: "What if my items get damaged?",
                answer: "We handle everything with utmost care. For any issues, contact us immediately and we'll resolve it promptly."
              },
              {
                question: "Can I change my pickup time after booking?",
                answer: "Contact us on WhatsApp immediately after booking. We'll try our best to accommodate changes based on availability."
              },
              {
                question: "Do you provide boxes for other purposes?",
                answer: "This service is specifically for hostel transfers. For other needs, contact us and we'll see how we can help!"
              }
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glassmorphism px-6 border-2 border-transparent hover:border-kiit-green/20">
                <AccordionTrigger className="text-left font-semibold hover:text-kiit-green">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* WhatsApp Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none"
          onClick={() => window.open('https://wa.me/919876543210', '_blank')}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          📲 Chat with Team
        </Button>
        </div>
        <Footer />
      </div>
  );
};

export default CartonTransfer;