import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Check, AlertCircle, Medal } from "lucide-react";

interface ActivityItemProps {
  activity: Activity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  // Get the appropriate icon based on activity type
  const getActivityIcon = () => {
    switch (activity.type) {
      case "submission_accepted":
        return <Check className="text-matrix text-sm" />;
      case "submission_pending":
        return <AlertCircle className="text-warning-yellow text-sm" />;
      case "achievement_unlocked":
        return <Medal className="text-electric-blue text-sm" />;
      default:
        return <AlertCircle className="text-dim-gray text-sm" />;
    }
  };

  // Format the timestamp
  const getTimeAgo = () => {
    if (!activity.createdAt) return "Unknown time";
    
    const date = typeof activity.createdAt === "string" 
      ? new Date(activity.createdAt) 
      : activity.createdAt;
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex items-start">
      <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center flex-shrink-0">
        {getActivityIcon()}
      </div>
      <div>
        <p className="text-light-gray text-sm font-mono">{activity.message}</p>
        <p className="text-dim-gray text-xs font-mono">{activity.details}</p>
        <p className="text-dim-gray text-xs font-mono mt-1">{getTimeAgo()}</p>
      </div>
    </div>
  );
}
