/*  
Create a warm, colorful, and youthful social media post for KIIT Saathi's *Celebrations Service*.  
Visuals: Students celebrating, balloons, cakes, confetti, surprise reactions.  
Style: Cheerful pastel tones, bold playful typography.  
Main Text: "Plan a Surprise with KIIT Saathi 🎉"  
Subtext: "Cakes, decorations & smiles – delivered!"  
Target Audience: College students, budget-friendly but full of joy.  
*/

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromoCodeDisplay } from "@/components/PromoCodeDisplay";
import { 
  Heart, 
  Gift, 
  Sparkles, 
  MapPin,
  Calendar,
  Phone,
  User,
  PartyPopper,
  Cake,
  Circle,
  Music,
  ArrowRight,
  Star
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const celebrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  celebrationType: z.string().min(1, "Please select a celebration type"),
  dateTime: z.string().min(1, "Date and time are required"),
  venueLocation: z.string().min(1, "Venue location is required"),
  specialRequests: z.string().optional()
});

type CelebrationFormData = z.infer<typeof celebrationSchema>;

const celebrationCombos = [
  {
    title: "Cake & Smiles",
    description: "Just a cake + handwritten note delivery",
    icon: Cake,
    gradient: "from-pink-400 to-pink-600",
    price: "₹299+",
    features: ["Fresh cake", "Handwritten note", "Surprise delivery"]
  },
  {
    title: "Party Starter Pack",
    description: "Cake + balloons + party poppers",
    icon: Circle,
    gradient: "from-purple-400 to-purple-600",
    price: "₹599+",
    features: ["Fresh cake", "Colorful balloons", "Party poppers", "Surprise setup"]
  },
  {
    title: "Full Surprise Setup",
    description: "Cake, decorations, music, confetti, and celebration spot",
    icon: Sparkles,
    gradient: "from-orange-400 to-orange-600",
    price: "₹1299+",
    features: ["Complete decoration", "Music system", "Confetti cannons", "Dedicated spot"]
  },
  {
    title: "Custom Celebration",
    description: "Tell us your plan, we make it happen",
    icon: Gift,
    gradient: "from-green-400 to-green-600",
    price: "Custom",
    features: ["Your unique idea", "Personalized setup", "Special arrangements", "Memorable experience"]
  }
];

const howItWorks = [
  {
    icon: Gift,
    title: "Choose Your Celebration Combo",
    description: "Pick from our fun packages or create your own",
    color: "text-pink-500"
  },
  {
    icon: Heart,
    title: "Tell Us the Details",
    description: "Date, time, friend's name, and location",
    color: "text-purple-500"
  },
  {
    icon: PartyPopper,
    title: "Sit Back & Relax",
    description: "We'll set it up and make you look like the best friend ever",
    color: "text-orange-500"
  }
];

export default function Celebrations() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const form = useForm<CelebrationFormData>({
    resolver: zodResolver(celebrationSchema)
  });

  const handleSubmit = async (data: CelebrationFormData) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-celebration-booking', {
        body: data
      });

      if (error) throw error;

      // Store the promo code and order details for display
      setPromoCode(result.promoCode);
      setOrderDetails({
        celebrationType: data.celebrationType,
        dateTime: data.dateTime,
        venueLocation: data.venueLocation,
        specialRequests: data.specialRequests
      });
      setShowPromoCode(true);

      toast({
        title: "Celebration Booked! 🎉",
        description: "Your promo code has been generated. Share it with your chosen bakery!"
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-purple-600 mb-6">
            <PartyPopper className="w-4 h-4" />
            Making Memories Since Day One
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Make Every Moment
            <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Memorable 💖
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Whether it's a surprise birthday, a heartfelt celebration, or just an excuse to party, 
            KIIT Saathi has you covered — from cakes & party sprays to full decoration setups. 
            <span className="font-semibold text-purple-600 block mt-2">You dream it, we deliver it.</span>
          </p>

          <Button 
            size="lg" 
            onClick={scrollToForm}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8 py-4 hover:scale-105 transition-transform"
          >
            Plan a Celebration 🎂
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="flex justify-center mt-12">
            <div className="text-8xl animate-bounce">🎉</div>
          </div>
        </div>
      </section>

      {/* Service Combos */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-poppins font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Choose Your Celebration Style
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From simple surprises to full party setups, we've got something for every celebration and budget
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {celebrationCombos.map((combo, index) => {
              const IconComponent = combo.icon;
              return (
                <Card key={index} className="glass-card hover-lift border-2 border-white/20 relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full"></div>
                    
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${combo.gradient} w-fit mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-poppins font-semibold mb-2">{combo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{combo.description}</p>
                    
                    <div className={`text-lg font-bold bg-gradient-to-r ${combo.gradient} bg-clip-text text-transparent mb-4`}>
                      {combo.price}
                    </div>
                    
                    <div className="space-y-2">
                      {combo.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-poppins font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="glass-card text-center hover-lift border-2 border-white/20">
                  <CardContent className="p-8">
                    <div className="bg-white/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <IconComponent className={`w-10 h-10 ${step.color}`} />
                    </div>
                    
                    <div className="text-2xl font-bold text-muted-foreground mb-2">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    <h3 className="text-xl font-poppins font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking Form or Promo Code Display */}
      <section id="booking-form" className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {showPromoCode && promoCode && orderDetails ? (
            <PromoCodeDisplay 
              promoCode={promoCode} 
              orderDetails={orderDetails}
            />
          ) : (
            <Card className="glass-card border-2 border-white/30">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-poppins">
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Book Your Celebration
                </span>
              </CardTitle>
              <p className="text-muted-foreground">Let's make this celebration unforgettable!</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Name *
                  </Label>
                  <Input 
                    id="name"
                    {...form.register("name")}
                    placeholder="Your full name"
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-300"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactNumber" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Number *
                  </Label>
                  <Input 
                    id="contactNumber"
                    {...form.register("contactNumber")}
                    placeholder="Your contact number"
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-300"
                  />
                  {form.formState.errors.contactNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.contactNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="celebrationType" className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Celebration Type / Combo *
                  </Label>
                  <Select onValueChange={(value) => form.setValue("celebrationType", value)}>
                    <SelectTrigger className="rounded-xl border-2 border-purple-100 focus:border-purple-300">
                      <SelectValue placeholder="Choose your celebration combo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cake-smiles">Cake & Smiles (₹299+)</SelectItem>
                      <SelectItem value="party-starter">Party Starter Pack (₹599+)</SelectItem>
                      <SelectItem value="full-surprise">Full Surprise Setup (₹1299+)</SelectItem>
                      <SelectItem value="custom">Custom Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.celebrationType && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.celebrationType.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateTime" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date & Time *
                  </Label>
                  <Input 
                    id="dateTime"
                    type="datetime-local"
                    {...form.register("dateTime")}
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-300"
                  />
                  {form.formState.errors.dateTime && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.dateTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="venueLocation" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Venue / Location *
                  </Label>
                  <Input 
                    id="venueLocation"
                    {...form.register("venueLocation")}
                    placeholder="e.g., Campus 15 Common Room, Kalinga Hostel Lawn"
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-300"
                  />
                  {form.formState.errors.venueLocation && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.venueLocation.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Special Requests
                  </Label>
                  <Textarea 
                    id="specialRequests"
                    {...form.register("specialRequests")}
                    placeholder="Any special themes, preferences, or requests? Tell us how to make this celebration perfect!"
                    rows={4}
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-300"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white font-semibold py-4 rounded-xl text-lg hover:scale-105 transition-transform"
                  disabled={isLoading}
                >
                  {isLoading ? "Booking Your Celebration..." : "Book My Celebration 🎉"}
                </Button>
              </form>
            </CardContent>
          </Card>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-100 via-purple-100 to-orange-100">
        <div className="container mx-auto text-center">
          <Card className="glass-card max-w-3xl mx-auto border-2 border-white/30">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🎈</div>
              <h3 className="text-2xl font-poppins font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Don't stress over last-minute birthdays — we've got your back!
                </span>
              </h3>
              <p className="text-lg text-muted-foreground">
                Let's make your friend's day unforgettable. Because great friends deserve great celebrations! ✨
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}