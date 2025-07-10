
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Trash2, MessageCircle, Megaphone, Clock, Shield, User, Building } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface PublicMessage {
  id: number;
  content: string;
  messageType: string;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  userId: number;
  username: string;
  userType: string;
  companyName: string | null;
  rank: string;
}

export default function PublicChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"message" | "announcement">("message");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query for messages with real-time polling
  const { data: messages = [], isLoading } = useQuery<PublicMessage[]>({
    queryKey: ["/api/public-chat"],
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; messageType: string }) => {
      return await apiRequest("POST", "/api/public-chat", data);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/public-chat"] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest("DELETE", `/api/public-chat/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-chat"] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message.trim(),
      messageType
    });
  };

  const handleDeleteMessage = (messageId: number) => {
    deleteMessageMutation.mutate(messageId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (msg: PublicMessage) => {
    if (msg.userType === "company" && msg.companyName) {
      return msg.companyName;
    }
    return msg.username;
  };

  const getUserBadge = (msg: PublicMessage) => {
    if (msg.userType === "company") {
      return (
        <Badge className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-xs">
          <Building className="h-3 w-3 mr-1" />
          Company
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-matrix/20 text-matrix border-matrix/30 text-xs">
        <Shield className="h-3 w-3 mr-1" />
        {msg.rank || "Hacker"}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col border-matrix/30 bg-terminal/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-mono text-matrix flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Public Chat
          <Badge className="ml-2 bg-surface text-matrix text-xs">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-96 pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-matrix/50 border-t-matrix rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-dim-gray">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-mono">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  msg.messageType === "announcement" 
                    ? "border-warning-yellow/30 bg-warning-yellow/5" 
                    : "border-matrix/20 bg-surface/50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {msg.messageType === "announcement" && (
                      <Megaphone className="h-4 w-4 text-warning-yellow" />
                    )}
                    <span className="font-mono text-sm text-light-gray">
                      {getUserDisplayName(msg)}
                    </span>
                    {getUserBadge(msg)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-dim-gray text-xs font-mono">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(msg.createdAt)}
                    </div>
                    
                    {msg.userId === user?.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-dim-gray hover:text-alert-red"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-light-gray text-sm font-mono whitespace-pre-wrap">
                  {msg.content}
                </p>
                
                {msg.isEdited && (
                  <p className="text-dim-gray text-xs font-mono mt-1 italic">
                    (edited)
                  </p>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="space-y-3">
          {user?.userType === "company" && (
            <div className="flex space-x-2">
              <Button
                type="button"
                size="sm"
                variant={messageType === "message" ? "default" : "outline"}
                onClick={() => setMessageType("message")}
                className="text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Message
              </Button>
              <Button
                type="button"
                size="sm"
                variant={messageType === "announcement" ? "default" : "outline"}
                onClick={() => setMessageType("announcement")}
                className="text-xs"
              >
                <Megaphone className="h-3 w-3 mr-1" />
                Announcement
              </Button>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                messageType === "announcement" 
                  ? "Announce something to the community..." 
                  : "Type your message..."
              }
              className="flex-1 min-h-[60px] max-h-32 bg-surface border-matrix/30 text-light-gray font-mono text-sm resize-none"
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-matrix hover:bg-matrix/80 text-black"
            >
              {sendMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-black/50 border-t-black rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex justify-between text-xs text-dim-gray font-mono">
            <span>{message.length}/1000 characters</span>
            {messageType === "announcement" && (
              <span className="text-warning-yellow">Announcement mode</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
