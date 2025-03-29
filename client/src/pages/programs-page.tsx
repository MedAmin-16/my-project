import { useQuery } from "@tanstack/react-query";
import { Program } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import ProgramCard from "@/components/ui/program-card";
import { Loader2, Search, AlertTriangle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import MatrixBackground from "@/components/matrix-background";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProgramsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);

  // Fetch all programs
  const {
    data: programs,
    isLoading,
    error
  } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  // Filter programs based on search term and scope filter
  const filteredPrograms = programs?.filter(program => {
    const matchesSearch = !searchTerm || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScope = !scopeFilter || 
      (Array.isArray(program.scope) && program.scope.includes(scopeFilter));
    
    return matchesSearch && matchesScope;
  });

  // Extract all unique scope types from all programs
  const scopeTypes = programs ? 
    [...new Set(programs.flatMap(program => 
      Array.isArray(program.scope) ? program.scope : []
    ))].sort() : 
    [];

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-mono font-bold text-light-gray mb-4">Bug Bounty Programs</h1>
          <p className="text-dim-gray font-mono">
            Find security vulnerabilities in these programs and get rewarded for your discoveries.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="terminal-card p-4 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-dim-gray" />
              <Input
                type="text"
                placeholder="Search programs..."
                className="terminal-input pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-60">
              <Select
                value={scopeFilter || "all"}
                onValueChange={(value) => setScopeFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="terminal-input">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-dim-gray" />
                    <SelectValue placeholder="Filter by scope" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-terminal border border-primary/30">
                  <SelectItem value="all">All scopes</SelectItem>
                  {scopeTypes.map(scope => (
                    <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-matrix" />
            </div>
          ) : error ? (
            <div className="terminal-card p-8 rounded-lg text-center">
              <AlertTriangle className="h-12 w-12 text-alert-red mx-auto mb-4" />
              <p className="text-alert-red font-mono text-lg">Failed to load programs</p>
              <p className="text-dim-gray font-mono mt-2">Please try again later</p>
            </div>
          ) : filteredPrograms && filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))
          ) : (
            <div className="terminal-card p-8 rounded-lg text-center">
              <p className="text-dim-gray font-mono">No programs match your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
