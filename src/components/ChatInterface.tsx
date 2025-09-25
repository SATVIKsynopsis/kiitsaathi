import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Shield, AlertTriangle, X } from 'lucide-react';
import { ChatMessage, ChatSession } from '@/hooks/useSeniorConnect';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  session: ChatSession;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<boolean>;
  onEndSession: () => void;
  isLoading?: boolean;
  demoName: string;
}

export function ChatInterface({ 
  session, 
  messages, 
  onSendMessage, 
  onEndSession, 
  isLoading = false,
  demoName 
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await onSendMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.sender_id === user?.id;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <CardTitle className="text-lg">Senior Connect Chat</CardTitle>
            <p className="text-sm text-muted-foreground">
              You are: <Badge variant="secondary">{demoName}</Badge>
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEndSession}>
          <X className="w-4 h-4 mr-2" />
          End Chat
        </Button>
      </CardHeader>

      {/* Safety Notice */}
      <div className="p-3 bg-red-50 border-b border-red-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800">Privacy Protected Chat</p>
            <p className="text-red-700">
              Phone numbers and personal contact info are automatically blocked. Keep it safe! 🔒
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">👋 Start your conversation!</p>
              <p className="text-sm">Remember to use only demo names and keep it friendly.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isMyMessage(message)
                        ? 'bg-campus-blue text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="break-words">{message.message}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p
                        className={`text-xs ${
                          isMyMessage(message)
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                      {message.is_flagged && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">Flagged</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message... (phone numbers will be blocked)"
            disabled={isSending || isLoading}
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending || isLoading}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          AI monitors messages for safety. Sharing contact info is prohibited.
        </p>
      </div>
    </Card>
  );
}