import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sampleQuestions = [
    "How do I book a carton for hostel move?",
    "Where's the nearest printer?",
    "Which seniors are available for mentoring?",
    "What's happening in campus today?",
    "Help me find my lost ID card",
  ];
  const handleSampleClick = (question: string) => {
    setMessage(question);
  };
  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-kiit-green to-campus-blue shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-campus-orange rounded-full animate-pulse"></div>
          </div>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 z-50">
          <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-kiit-green to-campus-blue p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">KIIT Saathi</h3>
                    <p className="text-white/80 text-sm">Your campus assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto bg-white/50 backdrop-blur-sm">
              {/* Welcome Message */}
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm">Hey there! 👋 I'm your KIIT Buddy. What can I help you with today?</p>
                </div>
              </div>

              {/* Sample Questions */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Try asking:
                </p>
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleClick(question)}
                    className="block w-full text-left p-2 text-xs bg-kiit-green-soft hover:bg-kiit-green-light/30 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiit-green/50"
                  onKeyPress={(e) => e.key === "Enter" && console.log("Send message:", message)}
                />
                <Button
                  size="sm"
                  className="bg-kiit-green hover:bg-kiit-green-dark text-white"
                  onClick={() => console.log("Send message:", message)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
