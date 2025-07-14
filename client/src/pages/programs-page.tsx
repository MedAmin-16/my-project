import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { useQuery } from "@tanstack/react-query";
import { Program } from "@shared/schema";

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Fetch programs data
  const { data: programs = [], isLoading, error } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    queryFn: async () => {
      const response = await fetch("/api/programs");
      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }
      return response.json();
    }
  });

  // Filter programs based on search and type
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = searchQuery === "" || 
      program.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "" || program.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold text-matrix mb-4">Available Programs</h1>
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search programs..."
              className="flex-grow p-2 bg-terminal border border-matrix/30 rounded text-light-gray"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="p-2 bg-terminal border border-matrix/30 rounded text-light-gray"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="web">Web</option>
              <option value="api">API</option>
              <option value="mobile">Mobile</option>
              <option value="cloud">Cloud</option>
              <option value="iot">IoT</option>
              <option value="crypto">Crypto</option>
              <option value="network">Network</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-light-gray">Loading programs...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error fetching programs: {error.message}</div>
        ) : filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="bg-terminal border border-matrix/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-matrix mb-2">{program.name}</h2>
                <p className="text-light-gray mb-4">{program.description}</p>
                <div className="mb-4">
                  <span className="text-dim-gray">Reward Range: </span>
                  <span className="text-matrix">{program.rewardRange}</span>
                </div>
                <Link href={`/programs/${program.id}`}>
                <button className="block w-full text-center py-2 bg-matrix/20 hover:bg-matrix/30 text-matrix rounded">
                  View Details
                </button>
              </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-light-gray">
            No programs found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}