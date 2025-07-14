import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MatrixBackground from "../components/matrix-background";

export default function ProgramsPage() {
  const { user, logoutMutation } = useAuth();

  // Mock data for demonstrations
  const { data: programs } = useQuery({
    queryKey: ["/api/programs"],
    queryFn: () => Promise.resolve([
      { 
        id: 1, 
        name: "SecureBank Web App", 
        description: "Find vulnerabilities in our banking web application.",
        company: "SecureBank Inc.",
        minReward: 100,
        maxReward: 5000,
        isActive: true
      },
      { 
        id: 2, 
        name: "CloudStore API", 
        description: "Security testing for our cloud storage API endpoints.",
        company: "CloudStore Technologies",
        minReward: 250,
        maxReward: 10000,
        isActive: true
      },
      { 
        id: 3, 
        name: "HealthTrack Mobile App", 
        description: "Security assessment of our health tracking mobile application.",
        company: "HealthTrack Systems",
        minReward: 150,
        maxReward: 3000,
        isActive: true
      },
    ]),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-black text-green-500 relative">
      <MatrixBackground />
      
      {/* Navbar */}
      <nav className="bg-black/90 border-b border-green-800 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold cyber-text">CyberHunt</a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <a className="hover:text-green-400 transition-colors duration-200 font-mono">Dashboard</a>
            </Link>
            <Link href="/programs">
              <a className="text-green-400 border-b border-green-400 pb-1 font-mono">Programs</a>
            </Link>
            <Link href="/submit">
              <a className="hover:text-green-400 transition-colors duration-200 font-mono">Submit Bug</a>
            </Link>
            
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-green-400 transition-colors duration-200 font-mono">
                <span>{user?.username}</span>
                <span>▼</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-black border border-green-700 rounded shadow-lg py-1 hidden group-hover:block">
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="block w-full text-left px-4 py-2 hover:bg-green-900/30 transition-colors duration-200 font-mono"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto p-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 cyber-text">Bug Bounty Programs</h1>
          <p className="font-mono">Explore available bug bounty programs and start hunting vulnerabilities.</p>
        </div>
        
        {/* Search & Filter */}
        <div className="cyber-container p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search programs..."
                className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
              />
            </div>
            
            <div className="md:w-48">
              <select className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono">
                <option value="">All Rewards</option>
                <option value="low">$100 - $500</option>
                <option value="medium">$500 - $2000</option>
                <option value="high">$2000+</option>
              </select>
            </div>
            
            <div className="md:w-48">
              <select className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono">
                <option value="">All Programs</option>
                <option value="web">Web Applications</option>
                <option value="mobile">Mobile Apps</option>
                <option value="api">APIs & Services</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Programs List */}
        {programs && programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="cyber-container hover:shadow-lg hover:shadow-green-900/20 transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold cyber-text">{program.name}</h2>
                    {program.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm mb-4 font-mono">{program.description}</p>
                  
                  <div className="text-sm mb-4 font-mono text-green-700">
                    <span>{program.company}</span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-mono">
                      <span>Reward Range:</span>
                      <span className="text-green-400">
                        ${program.minReward} - ${program.maxReward}
                      </span>
                    </div>
                  </div>
                  
                  <Link href={`/programs/${program.id}`}>
                    <a className="block w-full text-center py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors duration-300">
                      View Details
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-container p-8 text-center">
            <p className="font-mono mb-4">No programs found matching your criteria.</p>
            <button className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 rounded transition-colors duration-300 font-mono">
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}