import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Calendar, Check, X, Sparkles } from "lucide-react";
// Helper function to format time ago
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
};
import { useEvents } from "@/hooks/useEvents";

interface EventNotification {
  id: number;
  type: "upcoming_event";
  message: string;
  event_name: string;
  event_date: string;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);
  const { upcomingEvents, loading: eventsLoading, error } = useEvents();

  // Build notifications directly from upcomingEvents
  const notifications: (EventNotification & { is_read: boolean })[] = useMemo(() => {
    if (!user || eventsLoading || error) return [];
    return upcomingEvents.map((event) => ({
      id: event.id,
      type: "upcoming_event",
      message: `${event.event_name} is coming up!`,
      event_name: event.event_name,
      event_date: event.event_date,
      created_at: event.created_at || new Date().toISOString(),
      is_read: readIds.includes(event.id),
    }));
  }, [upcomingEvents, user, eventsLoading, error, readIds]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (notificationId: number) => {
    setReadIds((prev) => (prev.includes(notificationId) ? prev : [...prev, notificationId]));
  };

  const markAllAsRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-0 w-12 h-12 border-2 border-white/20"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Bell className="w-6 h-6 text-white relative z-10 group-hover:animate-pulse" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs rounded-full bg-gradient-to-r from-red-500 to-orange-500 border-2 border-white shadow-md animate-bounce"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {unreadCount > 0 && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-96 p-0 shadow-2xl rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-white/20 backdrop-blur-lg" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Upcoming Events
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs hover:bg-white/20 text-white/90 hover:text-white border border-white/30 transition-all duration-200 hover:scale-105"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {notifications.length > 0 && (
              <CardDescription className="text-blue-100">
                {unreadCount > 0 ? (
                  <>
                    <span className="animate-pulse">●</span> {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                  </>
                ) : (
                  "All caught up! 🎉"
                )}
              </CardDescription>
            )}
            {error && (
              <CardDescription className="text-red-200 bg-red-500/20 px-3 py-1 rounded-full text-sm">
                {error}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length === 0 && !error ? (
              <div className="p-8 text-center">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
                </div>
                <p className="text-gray-500 font-medium mb-2">No upcoming events</p>
                <p className="text-gray-400 text-sm">Check back later for new notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="p-2 space-y-1">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer border ${
                        !notification.is_read 
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 hover:from-blue-100 hover:to-indigo-100 shadow-md hover:shadow-lg" 
                          : "bg-white/50 border-gray-200/30 hover:bg-white/80 hover:border-gray-300/50"
                      } hover:scale-[1.02] hover:-translate-y-1`}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {!notification.is_read && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg" />
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${
                          !notification.is_read 
                            ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        }`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <p className={`text-sm font-semibold leading-relaxed ${
                              !notification.is_read ? "text-gray-900" : "text-gray-600"
                            }`}>
                              {notification.message}
                            </p>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                !notification.is_read 
                                  ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200" 
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium truncate">
                               {notification.event_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}