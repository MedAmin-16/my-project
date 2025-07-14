
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { Zap, Bug, Code, Target, Shield, Award, Trophy } from "lucide-react";

// All possible badges
const allBadges = [
  { id: 1, name: "First Blood", icon: <Zap className="h-8 w-8" />, description: "First vulnerability reported", acquired: true },
  { id: 2, name: "Bug Hunter", icon: <Bug className="h-8 w-8" />, description: "Found 5 valid vulnerabilities", acquired: true },
  { id: 3, name: "Code Breaker", icon: <Code className="h-8 w-8" />, description: "Successfully identified a critical vulnerability", acquired: false },
  { id: 4, name: "Perfect Score", icon: <Target className="h-8 w-8" />, description: "Achieved 100% accuracy in reports", acquired: false },
  { id: 5, name: "Elite Hunter", icon: <Shield className="h-8 w-8" />, description: "Reached Elite status", acquired: false },
  { id: 6, name: "Top Contributor", icon: <Award className="h-8 w-8" />, description: "Top 10 on the leaderboard", acquired: false },
  { id: 7, name: "Monthly Champion", icon: <Trophy className="h-8 w-8" />, description: "Highest points in a month", acquired: false }
];

export default function BadgesPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-mono font-bold text-light-gray mb-2">Achievement Badges</h1>
          <p className="text-dim-gray font-mono">
            Track your progress and showcase your accomplishments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-6 rounded-lg border ${
                badge.acquired
                  ? "border-matrix/40 bg-matrix/5"
                  : "border-dim-gray/20 bg-surface/50 opacity-50"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={badge.acquired ? "text-matrix" : "text-dim-gray"}>
                  {badge.icon}
                </div>
                <div>
                  <h3 className={`font-mono font-bold ${
                    badge.acquired ? "text-light-gray" : "text-dim-gray"
                  }`}>
                    {badge.name}
                  </h3>
                  <p className="text-sm text-dim-gray mt-1">{badge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
