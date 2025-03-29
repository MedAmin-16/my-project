import { Program } from "@shared/schema";
import { Link } from "wouter";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  // Handle scope array consistently
  const scopes = Array.isArray(program.scope) ? program.scope : [];

  return (
    <div className="terminal-card p-4 rounded-lg hover:bg-surface/50 transition-all duration-200 border border-matrix/30">
      <div className="flex items-start">
        <div className="h-12 w-12 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
          <span className="text-matrix font-mono text-lg">{program.logo || program.name.substring(0, 2).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-mono text-light-gray mb-1">{program.name}</h3>
            <span className={`text-xs font-mono ${
              program.status === "active" 
                ? "bg-matrix/10 text-matrix" 
                : program.isPrivate 
                  ? "bg-warning-yellow/20 text-warning-yellow" 
                  : "bg-accent/10 text-accent"
            } px-2 py-1 rounded-full`}>
              {program.isPrivate ? "Invite Only" : program.status}
            </span>
          </div>
          <p className="text-sm text-dim-gray mb-2">{program.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {scopes.map((scope, index) => (
              <span key={index} className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">
                {scope}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-dim-gray font-mono">Rewards: </span>
              <span className="text-xs text-warning-yellow font-mono">{program.rewardsRange}</span>
            </div>
            <button 
              onClick={() => window.location.href = `/programs/${program.id}`} 
              className="text-xs text-matrix hover:text-matrix-dark font-mono cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
