import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Zap, Clock, BookOpen } from "lucide-react";
import kiitMascot from "@/assets/kiit-mascot.png";

const ChatBotPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure Botpress webchat is visible and configured for this page
    const initializeBotpress = () => {
      // Check if Botpress webchat is available
      if (typeof window !== 'undefined' && (window as any).botpress) {
        const bp = (window as any).botpress;
        
        // Show the webchat widget
        bp.webchat.show();
        
        // Send a welcome message when the page loads
        setTimeout(() => {
          bp.webchat.sendEvent({
            type: 'show',
            channel: 'web',
            payload: {}
          });
        }, 1000);
      }
    };

    // Try to initialize immediately
    initializeBotpress();

    // Also try after a short delay in case scripts are still loading
    const timer = setTimeout(initializeBotpress, 2000);

    return () => {
      clearTimeout(timer);
      // Hide the webchat when leaving the page if needed
      if (typeof window !== 'undefined' && (window as any).botpress) {
        // Keep it visible for consistent experience across the site
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="inline-flex items-center gap-2 mb-4">
            <img src={kiitMascot} alt="KIIT Buddy" className="w-12 h-12" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              KIIT Saathi (AI Assistant)
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Your 24/7 KIIT Buddy 🤖
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get instant answers about campus life, services, and everything KIIT. 
            From finding your way around to booking services - I'm here to help!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">24/7 Available</CardTitle>
                <CardDescription>Get help anytime, day or night</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Instant Responses</CardTitle>
                <CardDescription>Quick answers to your queries</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Campus Expert</CardTitle>
                <CardDescription>Knows everything about KIIT</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Friendly Chat</CardTitle>
                <CardDescription>Natural conversation interface</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Botpress Chat Integration */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-kiit-green to-campus-blue text-white">
              <div className="flex items-center gap-3">
                <img src={kiitMascot} alt="KIIT Buddy" className="w-10 h-10" />
                <div>
                  <CardTitle className="text-white">KIIT Saathi (AI Assistant)</CardTitle>
                  <CardDescription className="text-white/80">
                    Your intelligent campus companion - powered by AI
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Ready to Help!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your AI assistant is ready to answer questions about KIIT campus, services, and more. 
                  Look for the chat widget in the bottom right corner to start a conversation!
                </p>
                <div className="mt-6 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>💬 Chat Features:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>• Ask about campus services and facilities</li>
                    <li>• Get help with bookings and applications</li>
                    <li>• Find information about societies and events</li>
                    <li>• Get directions and location details</li>
                    <li>• 24/7 availability for all your queries</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChatBotPage;