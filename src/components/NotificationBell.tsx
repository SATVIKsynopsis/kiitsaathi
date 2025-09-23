// NotificationBell.tsx
import React, { useState, useEffect, useMemo } from 'react'; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';

interface EventNotification {
  id: number;
  type: 'upcoming_event';
  message: string;
  event_name: string;
  event_date: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { upcomingEvents, loading: eventsLoading, error } = useEvents();

  // Memoize eventNotifications to prevent re-computation on every render
  const eventNotifications = useMemo(() => {
    if (!user || eventsLoading || error) return [];
    return upcomingEvents.map((event) => ({
      id: event.id,
      type: 'upcoming_event',
      message: `${event.event_name} is coming up!`,
      event_name: event.event_name,
      event_date: event.event_date,
      is_read: false,
      created_at: event.created_at || new Date().toISOString(),
    }));
  }, [upcomingEvents, user, eventsLoading, error]); // Dependencies for memoization

  // Update state only when eventNotifications changes
  useEffect(() => {
    setNotifications(eventNotifications);
    setUnreadCount(eventNotifications.length);
  }, [eventNotifications]); // Depend on memoized value

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    // <div className='fixed z-1000  ml-10'>
    <Popover open={isOpen} onOpenChange={setIsOpen} >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative bg-red-500 mt-10 text-white">
          <Bell className="w-10 h-10" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
            {notifications.length > 0 && (
              <CardDescription>
                {unreadCount} upcoming event{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            )}
            {error && <CardDescription className="text-red-500">{error}</CardDescription>}
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 && !error ? (
              <div className="p-4 text-center text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Calendar className={`w-4 h-4 ${!notification.is_read ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.event_date), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {notification.event_name}
                          </p>
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