import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, BellOff, X, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for notifications
export interface Notification {
  id: number;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string | Date;
}

export function NotificationsIndicator() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Query for notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Calculate unread count whenever notifications change
  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    }
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    // This would be a batch operation on the backend
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    // Using Promise.all to mark all unread notifications as read in parallel
    await Promise.all(
      unreadNotifications.map(notification => 
        markAsReadMutation.mutate(notification.id)
      )
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  // Format relative time (like "2 hours ago")
  const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationDate.toLocaleDateString();
  };

  // For mobile: full sheet
  const notificationSheet = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative md:hidden" 
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs bg-red-500 border-none"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm border-matrix/30 bg-black/90 backdrop-blur-xl">
        <SheetHeader className="flex flex-row items-center justify-between mb-4">
          <SheetTitle className="text-lg font-mono text-matrix">Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              className="text-xs border-matrix/30 text-matrix" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        
        <div className="space-y-4 mt-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-matrix/50 border-t-matrix rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-gray-500 flex flex-col items-center">
              <BellOff className="h-8 w-8 mb-2 text-gray-400" />
              <p className="font-mono">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "relative p-3 border rounded-md transition-colors",
                  notification.isRead 
                    ? "border-gray-800 bg-black/30" 
                    : "border-matrix/30 bg-matrix/5"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={cn(
                      "text-sm mb-1",
                      !notification.isRead && "text-matrix font-medium"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark as read</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                {notification.link && (
                  <Link 
                    to={notification.link}
                    className="text-xs flex items-center mt-2 text-matrix hover:underline"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    View details <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  // For desktop: dropdown
  const notificationDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hidden md:flex" 
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs bg-red-500 border-none"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 border-matrix/30 bg-black/90 backdrop-blur-xl">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span className="font-mono text-matrix">Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              className="text-xs border-matrix/30 text-matrix" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-matrix/50 border-t-matrix rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center">
            <BellOff className="h-8 w-8 mb-2 text-gray-400" />
            <p className="font-mono">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-default",
                  !notification.isRead && "bg-matrix/5"
                )}
              >
                <div className="flex justify-between items-start w-full">
                  <p className={cn(
                    "text-sm mb-1",
                    !notification.isRead && "text-matrix font-medium"
                  )}>
                    {notification.message}
                  </p>
                  
                  {!notification.isRead && (
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-6 w-6 -mt-1 -mr-1"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-between items-center w-full mt-1">
                  <p className="text-xs text-gray-500 font-mono">
                    {getRelativeTime(notification.createdAt)}
                  </p>
                  
                  {notification.link && (
                    <Link 
                      to={notification.link}
                      className="text-xs flex items-center text-matrix hover:underline"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      View details <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {notificationSheet}
      {notificationDropdown}
    </>
  );
}