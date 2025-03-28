import React from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Terminal, Cpu, Zap, ArrowRight, Github, User, LockKeyhole } from 'lucide-react';
import MatrixBackground from '../components/matrix-background';

export default function LandingPage() {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <MatrixBackground />
      
      {/* Header/Navbar */}
      <header className="relative z-10 border-b border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <Terminal className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold neon-text">CyberHunt</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium">
                How It Works
              </a>
              <a href="#rewards" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium">
                Rewards
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <a className="cyber-button flex items-center">
                  <LockKeyhole className="h-4 w-4 mr-2" />
                  <span>Enter Platform</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 glitch" data-text="CYBERHUNT">
                CYBERHUNT
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-300 mb-8 terminal-text typing-text">
                Secure the digital frontier. Earn rewards.
              </h2>
              <p className="text-gray-400 mb-8">
                Join our elite network of ethical hackers to discover vulnerabilities, 
                strengthen cybersecurity defenses, and earn competitive rewards for 
                your findings.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth">
                  <a className="cyber-button flex items-center justify-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Join as Researcher</span>
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="cyber-button-outline flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Create Security Program</span>
                  </a>
                </Link>
              </div>
            </div>
            
            <div className="cyber-card scanner p-2 order-first md:order-last">
              <div className="cyber-terminal text-sm h-64 overflow-y-auto">
                <div className="typing-text-1">
                  <span className="text-primary">$</span> initializing secure connection...
                </div>
                <div className="typing-text-2">
                  <span className="text-green-400">Connection established</span>
                </div>
                <div className="typing-text-3">
                  <span className="text-primary">$</span> scanning for active programs...
                </div>
                <div className="typing-text-4">
                  <span className="text-primary">$</span> found: 142 active vulnerability programs
                </div>
                <div className="typing-text-5">
                  <span className="text-primary">$</span> current payouts: $50 - $25,000 per finding
                </div>
                <div className="typing-text-6">
                  <span className="text-primary">$</span> accessing CyberHunt platform...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section id="features" className="relative z-10 bg-black/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold neon-text mb-4">PLATFORM FEATURES</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our cutting-edge platform offers powerful tools for both hackers and program owners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="cyber-card p-6 scanner fade-in">
              <div className="flex items-center mb-4">
                <Cpu className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-xl font-bold">Advanced Security Testing</h3>
              </div>
              <p className="text-gray-400">
                Access specialized tools and methodologies to uncover critical vulnerabilities in applications, networks, and systems.
              </p>
            </div>
            
            <div className="cyber-card p-6 scanner fade-in">
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-xl font-bold">Real-time Reporting</h3>
              </div>
              <p className="text-gray-400">
                Submit and track vulnerability reports with comprehensive details, evidence, and impact assessments in real-time.
              </p>
            </div>
            
            <div className="cyber-card p-6 scanner fade-in">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-xl font-bold">Secure Collaboration</h3>
              </div>
              <p className="text-gray-400">
                Collaborate securely with program owners through encrypted channels to verify findings and implement fixes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section id="how-it-works" className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold neon-text mb-4">HOW IT WORKS</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Start finding vulnerabilities and earning rewards in just a few simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="cyber-card p-6 scanner relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-black border border-primary rounded-full flex items-center justify-center text-primary font-bold">1</div>
              <h3 className="text-lg font-bold mb-3 mt-2">Create an Account</h3>
              <p className="text-gray-400 text-sm">
                Sign up and complete your hacker profile with your skills and expertise.
              </p>
            </div>
            
            <div className="cyber-card p-6 scanner relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-black border border-primary rounded-full flex items-center justify-center text-primary font-bold">2</div>
              <h3 className="text-lg font-bold mb-3 mt-2">Explore Programs</h3>
              <p className="text-gray-400 text-sm">
                Browse available security programs and their scope, rewards, and requirements.
              </p>
            </div>
            
            <div className="cyber-card p-6 scanner relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-black border border-primary rounded-full flex items-center justify-center text-primary font-bold">3</div>
              <h3 className="text-lg font-bold mb-3 mt-2">Submit Findings</h3>
              <p className="text-gray-400 text-sm">
                Document and report discovered vulnerabilities with detailed proof of concept.
              </p>
            </div>
            
            <div className="cyber-card p-6 scanner relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-black border border-primary rounded-full flex items-center justify-center text-primary font-bold">4</div>
              <h3 className="text-lg font-bold mb-3 mt-2">Get Rewarded</h3>
              <p className="text-gray-400 text-sm">
                Receive bounties for valid findings based on severity and impact.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rewards section */}
      <section id="rewards" className="relative z-10 bg-black/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold neon-text mb-4">BOUNTY REWARDS</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our programs offer competitive rewards based on vulnerability severity.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full cyber-card">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-left">Severity</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-right">Typical Reward</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">
                    <span className="flex items-center">
                      <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                      Critical
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">Remote code execution, data breaches</td>
                  <td className="py-3 px-4 text-right neon-text">$10,000 - $25,000</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">
                    <span className="flex items-center">
                      <span className="h-2 w-2 bg-orange-500 rounded-full mr-2"></span>
                      High
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">Authentication bypass, significant logic flaws</td>
                  <td className="py-3 px-4 text-right neon-text">$3,000 - $10,000</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">
                    <span className="flex items-center">
                      <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                      Medium
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">Sensitive data exposure, XSS, CSRF</td>
                  <td className="py-3 px-4 text-right neon-text">$500 - $3,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="flex items-center">
                      <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                      Low
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">Minor configuration issues, best practice violations</td>
                  <td className="py-3 px-4 text-right neon-text">$50 - $500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="relative z-10 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to join the elite ranks of CyberHunt?</h2>
          <p className="text-gray-400 mb-8">
            Create your account today and start hunting for vulnerabilities or launch your own security program.
          </p>
          <Link href="/auth">
            <a className="cyber-button inline-flex items-center justify-center text-lg px-8 py-3">
              <span>Join Now</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-black/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Terminal className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold neon-text">CyberHunt</span>
              </div>
              <p className="text-gray-400 text-sm">
                The premier platform for ethical hackers and security-conscious organizations.
              </p>
              <div className="flex mt-4 space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary">
                  <Terminal className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-primary">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Programs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Leaderboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Rewards</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CyberHunt. All rights reserved. 
              <br className="md:hidden" /> Securing the digital frontier, one vulnerability at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}