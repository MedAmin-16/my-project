
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Megaphone, Users, Building2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

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

interface PublicChatProps {
  currentUser?: {
    id: number;
    username: string;
    userType: 'hacker' | 'company';
  };
}

export default function PublicChat({ currentUser }: PublicChatProps) {
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'message' | 'announcement'>('message');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/public-chat/messages', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      setIsSending(true);
      const response = await fetch('/api/public-chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      toast({
        title: 'Message sent',
        description: 'Your message has been posted to the public chat',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get user avatar initials
  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  // Get user type badge
  const getUserTypeBadge = (userType: 'hacker' | 'company') => {
    if (userType === 'company') {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Building2 className="w-3 h-3 mr-1" />
          Company
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Users className="w-3 h-3 mr-1" />
        Researcher
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Public Chat
          <Badge variant="secondary" className="ml-auto">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No messages yet. Be the first to say hello!</div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={
                      message.user.userType === 'company' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }>
                      {getUserInitials(message.user.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.user.username}</span>
                      {getUserTypeBadge(message.user.userType)}
                      {message.messageType === 'announcement' && (
                        <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200">
                          <Megaphone className="w-3 h-3 mr-1" />
                          Announcement
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      message.messageType === 'announcement' 
                        ? 'bg-orange-50 border border-orange-200' 
                        : 'bg-gray-50'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      {message.isEdited && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Edited {format(new Date(message.editedAt!), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Message Input Area */}
        <div className="p-6 bg-gray-50">
          {currentUser ? (
            <div className="space-y-3">
              {/* Message Type Selector (only for companies) */}
              {currentUser.userType === 'company' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Select
                    value={messageType}
                    onValueChange={(value: 'message' | 'announcement') => setMessageType(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </div>
                      </SelectItem>
                      <SelectItem value="announcement">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4" />
                          Announcement
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    messageType === 'announcement' 
                      ? "Write an announcement for the community..."
                      : "Type your message..."
                  }
                  className="flex-1 min-h-[60px] resize-none"
                  maxLength={1000}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="px-3 self-end"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Press Shift+Enter for new line</span>
                <span>{newMessage.length}/1000</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Please log in to participate in the public chat
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
