import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Calendar, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
          className="relative bg-red-500 hover:bg-gray-200 rounded-full shadow-md"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0 shadow-xl rounded-xl bg-campus-blue" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs hover:bg-black hover:text-white bg-gray-200"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            {notifications.length > 0 && (
              <CardDescription>
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </CardDescription>
            )}
            {error && <CardDescription className="text-red-500">{error}</CardDescription>}
          </CardHeader>

          <CardContent className="p-2 bg-black/20 rounded">
            {notifications.length === 0 && !error ? (
              <div className="p-6 text-center text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 transition-all hover:bg-gray-50 ${
                        !notification.is_read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Calendar
                          className={`w-5 h-5 mt-1 ${
                            !notification.is_read ? "text-blue-500" : "text-gray-400"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-sm font-medium ${
                                !notification.is_read ? "text-gray-900" : "text-gray-600"
                              }`}
                            >
                              {notification.message}
                            </p>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-500 hover:text-green-600"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.event_date), {
                              addSuffix: true,
                            })}
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
