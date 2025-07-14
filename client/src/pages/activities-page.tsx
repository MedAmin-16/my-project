
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import ActivityItem from "@/components/ui/activity-item";
import { Clock, CheckCircle, XCircle, Activity as ActivityIcon } from "lucide-react";

export default function ActivitiesPage() {
  const { user } = useAuth();

  const {
    data: activities,
    isLoading,
    error
  } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <h1 className="text-2xl font-mono font-bold text-light-gray mb-6">Activity History</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {isLoading ? (
              <div className="terminal-card p-6 rounded-lg text-center">
                <p className="text-matrix font-mono">Loading activities...</p>
              </div>
            ) : error ? (
              <div className="terminal-card p-6 rounded-lg text-center">
                <p className="text-alert-red font-mono">Error loading activities</p>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="terminal-card p-4 rounded-lg border border-matrix/30">
                    <ActivityItem activity={activity} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="terminal-card p-8 rounded-lg text-center">
                <ActivityIcon className="h-12 w-12 text-dim-gray mx-auto mb-4" />
                <p className="text-matrix text-lg mb-2">No activity yet</p>
                <p className="text-dim-gray">Start interacting with the platform to see your activity here.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Filter Activity</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center p-3 rounded bg-matrix/10 hover:bg-matrix/20 transition-all duration-200 border border-matrix/30">
                  <CheckCircle className="text-matrix mr-3 h-5 w-5" />
                  <span className="text-light-gray font-mono text-sm">Accepted Submissions</span>
                </button>
                <button className="w-full flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                  <XCircle className="text-alert-red mr-3 h-5 w-5" />
                  <span className="text-light-gray font-mono text-sm">Rejected Submissions</span>
                </button>
                <button className="w-full flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                  <Clock className="text-warning-yellow mr-3 h-5 w-5" />
                  <span className="text-light-gray font-mono text-sm">Pending Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
