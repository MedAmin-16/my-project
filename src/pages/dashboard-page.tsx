import React, { useState } from 'react';
import { Link } from 'wouter';
import { Terminal, Shield, Award, ArrowRight, Code, LogOut, User, Activity, FileCode, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import MatrixBackground from '../components/matrix-background';

type DashboardTab = 'overview' | 'programs' | 'submissions' | 'activity';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Terminal className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold neon-text">CyberHunt</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <Link href="/dashboard">
                  <a className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'overview' ? 'text-primary bg-black/30 neon-border' : 'text-gray-300 hover:text-white'
                  }`}>
                    Overview
                  </a>
                </Link>
                <Link href="/programs">
                  <a className="px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white">
                    Programs
                  </a>
                </Link>
                <Link href="/dashboard?tab=submissions">
                  <a className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'submissions' ? 'text-primary bg-black/30 neon-border' : 'text-gray-300 hover:text-white'
                  }`}>
                    My Submissions
                  </a>
                </Link>
                <Link href="/dashboard?tab=activity">
                  <a className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'activity' ? 'text-primary bg-black/30 neon-border' : 'text-gray-300 hover:text-white'
                  }`}>
                    Activity
                  </a>
                </Link>
              </nav>
            </div>
            
            <div className="hidden md:flex items-center">
              <button 
                onClick={handleLogout}
                className="cyber-button ml-4 px-3 py-1 text-sm flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-10 bg-black/90 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'overview' ? 'text-primary bg-black neon-border' : 'text-gray-300 hover:text-white'
              }`}>
                Overview
              </a>
            </Link>
            <Link href="/programs">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white">
                Programs
              </a>
            </Link>
            <Link href="/dashboard?tab=submissions">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'submissions' ? 'text-primary bg-black neon-border' : 'text-gray-300 hover:text-white'
              }`}>
                My Submissions
              </a>
            </Link>
            <Link href="/dashboard?tab=activity">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'activity' ? 'text-primary bg-black neon-border' : 'text-gray-300 hover:text-white'
              }`}>
                Activity
              </a>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome section */}
          <div className="mb-8 cyber-card p-6 scanner">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold terminal-text">
                Welcome, {user?.username || 'Hacker'}
              </h1>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center border border-primary neon-border">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{user?.username || 'Hacker'}</div>
                  <div className="text-xs text-gray-400">Reputation: {user?.reputation || 0}</div>
                </div>
              </div>
            </div>
            <p className="text-gray-300">
              Ready to hunt for vulnerabilities? Browse the active programs and start hacking today!
            </p>
          </div>
          
          {/* Dashboard sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Programs */}
            <div className="cyber-card p-6">
              <h2 className="text-lg font-bold mb-4 terminal-text flex items-center">
                <FileCode className="h-5 w-5 mr-2" />
                Active Programs
              </h2>
              <p className="text-gray-300 mb-4">
                These programs are accepting new vulnerability reports.
              </p>
              <Link href="/programs">
                <a className="cyber-button w-full justify-center">
                  View All Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </div>
            
            {/* My Submissions */}
            <div className="cyber-card p-6">
              <h2 className="text-lg font-bold mb-4 terminal-text flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                My Submissions
              </h2>
              <p className="text-gray-300 mb-4">
                Track the status of your submitted vulnerabilities.
              </p>
              <Link href="/dashboard?tab=submissions">
                <a className="cyber-button w-full justify-center">
                  View My Submissions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </div>
            
            {/* Activity Feed */}
            <div className="cyber-card p-6">
              <h2 className="text-lg font-bold mb-4 terminal-text flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </h2>
              <p className="text-gray-300 mb-4">
                Stay updated with your latest activities and notifications.
              </p>
              <Link href="/dashboard?tab=activity">
                <a className="cyber-button w-full justify-center">
                  View Activity Feed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 neon-text">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/programs">
                <a className="cyber-card p-4 text-center hover:neon-border transition-all duration-200">
                  <Search className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm">Find Programs</span>
                </a>
              </Link>
              <Link href="/submit-bug">
                <a className="cyber-card p-4 text-center hover:neon-border transition-all duration-200">
                  <Code className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm">Submit Bug</span>
                </a>
              </Link>
              <Link href="/dashboard?tab=submissions">
                <a className="cyber-card p-4 text-center hover:neon-border transition-all duration-200">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm">My Reports</span>
                </a>
              </Link>
              <Link href="/dashboard?tab=activity">
                <a className="cyber-card p-4 text-center hover:neon-border transition-all duration-200">
                  <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm">Reputation</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-black/50 py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Terminal className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-bold terminal-text">CyberHunt</span>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} CyberHunt. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}