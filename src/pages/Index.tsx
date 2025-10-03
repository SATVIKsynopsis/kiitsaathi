import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { NotificationBell } from "@/components/NotificationBell";
import { AdminCommandExecutor } from "@/components/AdminCommandExecutor";
import { MeetOurTeam } from "@/components/MeetOurTeam";
import OurMentors from "@/components/OurMentors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Index = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const handleContactSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: data,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent! ",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });

      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="fixed top-20 right-4 sm:right-8 lg:right-14 z-[10000] ">
        <NotificationBell />
      </div>
      <Hero />

      <div className="bg-gradient-to-br from-kiit-green-soft to-white/10">

        {/* Services Section */}
        <section id="services" className="py-0 my-auto ">
          <ServicesGrid />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-gradient mb-6">
              How KIIT Saathi Works
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Your campus life made easier in just a few simple steps
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl sm:text-2xl font-bold">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Choose Your Service</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Browse through our campus services and select what you need</p>
              </div>

              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl sm:text-2xl font-bold">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Connect & Request</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Get connected with verified students or service providers instantly</p>
              </div>

              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl sm:text-2xl font-bold">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Get It Done</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Enjoy hassle-free campus services with trusted fellow students</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-8 sm:py-12 lg:py-16">
          <Testimonials />
        </section>

        {/* Our Mentors Section */}
        <section id="mentors">
          <OurMentors />
        </section>

        {/* Meet Our Team Section */}
        <section id="team">
          <MeetOurTeam />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-8 sm:py-12 lg:py-16 bg-gradient-soft">
          <FAQ />
        </section>
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-gradient mb-6">
              Get In Touch
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Have questions? We're here to help make your campus life better
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8 mb-8 lg:mb-0">
              <div className="flex items-start sm:items-center gap-4 px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg">Email Us</h3>
                  <p className="text-sm sm:text-base text-muted-foreground break-all">official@kiitsaathi.in</p>
                </div>
              </div>

              <div className="flex items-start sm:items-center gap-4 px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg">Call Us</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">+91 9717008778</p>
                </div>
              </div>

              <div className="flex items-start sm:items-center gap-4 px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg">Visit Us</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">KIIT University, Bhubaneswar, Odisha</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-gradient flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleContactSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@kiit.ac.in" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help you?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us more about your query..."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full gradient-primary text-white font-semibold py-3 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot />
      <AdminCommandExecutor />
    </div>
  );
};

export default Index;
