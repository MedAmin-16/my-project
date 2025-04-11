
import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, Terminal, RefreshCw } from 'lucide-react';
import MatrixBackground from '../components/matrix-background';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      
      <header className="relative z-10 border-b border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <Terminal className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold neon-text">CyberHunt</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="max-w-md w-full">
          <div className="cyber-card p-8 scanner text-center">
            <h1 className="glitch text-6xl font-bold mb-4" data-text="404">404</h1>
            <div className="mb-8">
              <p className="text-xl font-bold mb-2 terminal-text">
                // SYSTEM BREACH DETECTED
              </p>
              <p className="text-gray-300 mb-4">
                The resource at <span className="text-primary font-mono">{location}</span> could not be found.
              </p>
              <div className="cyber-terminal text-sm text-left mb-4 py-2 px-3">
                <p className="typing-text-1">
                  <span className="text-primary">$</span> scan_directory -r {location}
                </p>
                <p className="typing-text-2 text-red-500">
                  Error: Path not found in the system.
                </p>
                <p className="typing-text-3">
                  <span className="text-primary">$</span> suggest_alternatives
                </p>
                <p className="typing-text-4">
                  Recommended paths:
                </p>
                <p className="typing-text-5">
                  <span className="text-green-400">- /</span> (home)
                </p>
                <p className="typing-text-6">
                  <span className="text-green-400">- /dashboard</span> (secure area)
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <Button asChild variant="default" className="cyber-button">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="cyber-button-outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <div className="mt-8 text-xs text-gray-400">
              Error Code: 0x8007001F • Timestamp: {new Date().toISOString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
