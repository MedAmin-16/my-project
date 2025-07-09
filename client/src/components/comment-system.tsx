
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Reply, Edit3, Trash2, Send, User, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CommentWithUser } from "@shared/schema";

interface CommentSystemProps {
  submissionId: number;
  currentUserId?: number;
}

interface CommentFormProps {
  submissionId: number;
  parentId?: number;
  onCancel?: () => void;
  placeholder?: string;
}

// Markdown-like text formatter (simple implementation)
const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-terminal/20 px-1 rounded text-matrix">$1</code>')
    .replace(/\n/g, '<br>');
};

const CommentForm: React.FC<CommentFormProps> = ({ 
  submissionId, 
  parentId, 
  onCancel, 
  placeholder = "Write a comment..." 
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitComment = useMutation({
    mutationFn: async (data: { content: string; parentId?: number }) => {
      const res = await apiRequest("POST", `/api/submissions/${submissionId}/comments`, data);
      return await res.json();
    },
    onSuccess: () => {
      setContent("");
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: [`/api/submissions/${submissionId}/comments`] });
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
      onCancel?.();
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    submitComment.mutate({ content: content.trim(), parentId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="terminal-input min-h-[100px] resize-none"
        maxLength={5000}
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-dim-gray font-mono">
          Supports **bold**, *italic*, and `code` formatting
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
              className="text-dim-gray border-dim-gray hover:bg-terminal"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            size="sm"
            className="bg-matrix hover:bg-matrix/80 text-black"
          >
            {isSubmitting ? (
              "Posting..."
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

const CommentItem: React.FC<{ 
  comment: CommentWithUser; 
  submissionId: number; 
  currentUserId?: number;
  level?: number;
}> = ({ comment, submissionId, currentUserId, level = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canEdit = currentUserId === comment.userId;
  const canDelete = currentUserId === comment.userId;

  const getUserIcon = (userType: string) => {
    switch (userType) {
      case "company":
        return <Building2 className="w-3 h-3" />;
      case "admin":
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getUserBadgeColor = (userType: string) => {
    switch (userType) {
      case "company":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-matrix/20 text-matrix border-matrix/30";
    }
  };

  const updateComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("PUT", `/api/comments/${comment.id}`, { content });
      return await res.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`/api/submissions/${submissionId}/comments`] });
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/comments/${comment.id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/submissions/${submissionId}/comments`] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (!editContent.trim()) return;
    updateComment.mutate(editContent.trim());
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate();
    }
  };

  const marginLeft = Math.min(level * 24, 96); // Max 4 levels deep

  return (
    <div className="space-y-3" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="terminal-card p-4 rounded-lg border border-primary/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-matrix/20 border border-matrix/30">
              <div className="flex items-center justify-center h-full w-full text-matrix">
                {getUserIcon(comment.user.userType)}
              </div>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="text-light-gray font-mono text-sm">
                {comment.user.username}
              </span>
              <Badge className={`text-xs ${getUserBadgeColor(comment.user.userType)}`}>
                {comment.user.userType}
              </Badge>
            </div>
            <span className="text-dim-gray font-mono text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              {comment.isEdited && " (edited)"}
            </span>
          </div>
          
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 p-0 text-dim-gray hover:text-light-gray"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 w-6 p-0 text-dim-gray hover:text-alert-red"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="terminal-input min-h-[80px] resize-none"
              maxLength={5000}
            />
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="text-dim-gray border-dim-gray hover:bg-terminal"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={!editContent.trim() || updateComment.isPending}
                className="bg-matrix hover:bg-matrix/80 text-black"
              >
                {updateComment.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="text-light-gray font-mono text-sm leading-relaxed mb-3"
              dangerouslySetInnerHTML={{ __html: formatText(comment.content) }}
            />
            
            {level < 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-dim-gray hover:text-matrix font-mono text-xs"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
          </>
        )}
      </div>

      {isReplying && (
        <div className="ml-6">
          <CommentForm
            submissionId={submissionId}
            parentId={comment.id}
            onCancel={() => setIsReplying(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              submissionId={submissionId}
              currentUserId={currentUserId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSystem: React.FC<CommentSystemProps> = ({ 
  submissionId, 
  currentUserId = 1 // Mock current user
}) => {
  const { data: comments, isLoading, error } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/submissions/${submissionId}/comments`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/submissions/${submissionId}/comments`);
      return await res.json();
    },
  });

  const queryClient = useQueryClient();

  // Mark comments as read when component mounts
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await apiRequest("POST", `/api/submissions/${submissionId}/comments/mark-read`);
      } catch (error) {
        console.error("Failed to mark comments as read:", error);
      }
    };
    
    markAsRead();
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-matrix" />
          <h3 className="text-lg font-mono text-light-gray">Comments</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="terminal-card p-4 rounded-lg">
              <div className="h-4 bg-terminal rounded mb-2"></div>
              <div className="h-16 bg-terminal rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-card p-4 rounded-lg border border-alert-red/30">
        <p className="text-alert-red font-mono">Failed to load comments</p>
      </div>
    );
  }

  const commentCount = comments?.reduce((count, comment) => {
    return count + 1 + (comment.replies?.length || 0);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-matrix" />
          <h3 className="text-lg font-mono text-light-gray">
            Comments ({commentCount})
          </h3>
        </div>
      </div>

      <CommentForm submissionId={submissionId} />

      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              submissionId={submissionId}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="terminal-card p-8 rounded-lg text-center">
            <MessageCircle className="w-12 h-12 text-dim-gray mx-auto mb-4" />
            <p className="text-dim-gray font-mono">No comments yet</p>
            <p className="text-dim-gray font-mono text-sm mt-1">
              Be the first to add a comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSystem;
