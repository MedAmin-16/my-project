
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, ExternalLink, Building2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

interface PublicMessage {
  id: number;
  content: string;
  userId: number;
  messageType: 'message' | 'announcement';
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    userType: 'hacker' | 'company';
  };
}

export default function PublicChatWidget() {
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recent messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/public-chat/messages?limit=5', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.slice(-5)); // Get last 5 messages
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Set up polling for updates
    const interval = setInterval(fetchMessages, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get user avatar initials
  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  // Truncate long messages
  const truncateMessage = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Public Chat
          </div>
          <Link href="/public-chat">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No messages yet</div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className={`text-xs ${
                      message.user.userType === 'company' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getUserInitials(message.user.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium truncate">
                        {message.user.username}
                      </span>
                      {message.user.userType === 'company' ? (
                        <Building2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Users className="w-3 h-3 text-green-600 flex-shrink-0" />
                      )}
                      {message.messageType === 'announcement' && (
                        <Badge variant="secondary" className="text-xs py-0 px-1 h-4">
                          📢
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {truncateMessage(message.content)}
                    </p>

                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 pt-3 border-t">
          <Link href="/public-chat">
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Join the conversation
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
