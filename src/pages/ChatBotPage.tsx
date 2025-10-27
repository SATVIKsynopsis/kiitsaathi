import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Zap, Clock, BookOpen, Send, Sparkles } from "lucide-react";
import kiitMascot from "@/assets/kiitMascot.jpg"
import { Alert } from "@/components/ui/alert";

declare global {
  interface Window {
    botpressWebChat?: {
      sendEvent: (event: any) => void;
    };
  }
}

const ChatBotPage = () => {
  const navigate = useNavigate();
  useEffect(() => {alert("KIIT Saathi's AI Assistant is online, At your right corner")}, []); 
  // const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState([
  //   {
  //     type: 'bot',
  //     text: "Hey there! 👋 I'm your KIIT Buddy. What can I help you with today?"
  //   }
  // ]);


  // useEffect(() => {
  //   // Load Botpress webchat script dynamically
  //   const loadBotpressScript = () => {
  //     // Check if script already exists
  //     if (document.getElementById('botpress-webchat')) {
  //       console.log('Botpress script already loaded');
  //       return;
  //     }

  //     // Load the inject script
  //     const injectScript = document.createElement('script');
  //     injectScript.id = 'botpress-webchat';
  //     injectScript.src = 'https://cdn.botpress.cloud/webchat/v3.3/inject.js';
  //     injectScript.async = true;

  //     injectScript.onload = () => {
  //       console.log('Botpress inject script loaded successfully');

  //       // Load the configuration script
  //       const configScript = document.createElement('script');
  //       configScript.src = 'https://files.bpcontent.cloud/2025/08/09/19/20250809195719-5V5LMRXW.js';
  //       configScript.defer = true;

  //       configScript.onload = () => {
  //         console.log('Botpress configuration loaded successfully');
  //       };

  //       configScript.onerror = () => {
  //         console.error('Failed to load Botpress configuration script');
  //       };

  //       document.body.appendChild(configScript);
  //     };

  //     injectScript.onerror = () => {
  //       console.error('Failed to load Botpress inject script');
  //     };

  //     document.body.appendChild(injectScript);
  //   };

  //   loadBotpressScript();

  //   return () => {
  //     console.log('ChatBotPage unmounting');
  //     // Remove scripts on unmount
  //     const injectScript = document.getElementById('botpress-webchat');
  //     if (injectScript) {
  //       injectScript.remove();
  //     }

  //     // Remove config script if exists
  //     const configScripts = document.querySelectorAll('script[src*="bpcontent.cloud"]');
  //     configScripts.forEach(script => script.remove());
  //   };
  // }, []);

  // const sampleQuestions = [
  //   "How do I book a carton for hostel move?",
  //   "Where's the nearest printer?",
  //   "Which seniors are available for mentoring?",
  //   "What's happening in campus today?",
  //   "Help me find my lost ID card"
  // ];

  // const handleSampleClick = (question: string) => {
  //   setMessage(question);
  // };

  // const handleSendMessage = () => {
  //   if (message.trim()) {
  //     // Add user message
  //     setMessages(prev => [...prev, { type: 'user', text: message }]);

  //     // Simulate bot response (replace with actual API call)
  //     setTimeout(() => {
  //       setMessages(prev => [...prev, {
  //         type: 'bot',
  //         text: "Thanks for your question! I'm still learning, but I'll help you the best I can."
  //       }]);
  //     }, 1000);

  //     setMessage("");
  //   }
  // };

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     handleSendMessage();
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 ">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-2 self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              KIIT Saathi (AI Assistant)
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Your 24/7 KIIT Buddy
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
            <Card className="text-center rounded-xl">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">24/7 Available</CardTitle>
                <CardDescription>Get help anytime, day or night</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center rounded-xl ">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Instant Responses</CardTitle>
                <CardDescription>Quick answers to your queries</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center rounded-xl">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Campus Expert</CardTitle>
                <CardDescription>Knows everything about KIIT</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center rounded-xl">
              <CardHeader>
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Friendly Chat</CardTitle>
                <CardDescription>Natural conversation interface</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* <button
        onClick={() =>
          window.botpressWebChat?.sendEvent({ type: 'show' })
        }
        className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90"
      >
        Chat Now
      </button> */}

      {/* Chat Interface */}
      {/* <section className="py-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card overflow-hidden shadow-2xl">
            Header
            <div className="bg-gradient-to-r from-kiit-green to-campus-blue p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={kiitMascot} alt="KIIT Buddy" className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-semibold text-lg">KIIT Saathi</h3>
                    <p className="text-white/80 text-sm">Your campus assistant</p>
                  </div>
                </div>
              </div>
            </div>

            Messages
            <div className="p-6 h-96 overflow-y-auto bg-white/50 backdrop-blur-sm">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 mb-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.type === 'bot' && (
                    <img src={kiitMascot} alt="KIIT Buddy" className="w-8 h-8 mt-1 rounded-full flex-shrink-0" />
                  )}
                  <div className={`rounded-lg p-4 shadow-sm max-w-[80%] ${
                    msg.type === 'bot' 
                      ? 'bg-white' 
                      : 'bg-gradient-to-r from-kiit-green to-campus-blue text-white'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}

              Sample Questions - Only show at start
              {messages.length === 1 && (
                <div className="space-y-2 mt-6">
                  <p className="text-xs text-muted-foreground font-medium mb-3 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Try asking:
                  </p>
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleClick(question)}
                      className="block w-full text-left p-3 text-sm bg-kiit-green-soft hover:bg-kiit-green-light/30 rounded-lg transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            Input
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiit-green/50"
                />
                <Button
                  size="sm"
                  className="bg-kiit-green hover:bg-kiit-green-dark text-white px-6"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
};

export default ChatBotPage;