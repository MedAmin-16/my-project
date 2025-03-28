import { Link } from "wouter";
import MatrixBackground from "../components/matrix-background";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-green-500">
      <MatrixBackground />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-green-400 animate-pulse">
            CyberHunt
          </h1>
          <p className="text-xl md:text-2xl font-mono">
            Find vulnerabilities. Earn rewards. Secure the digital world.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="cyber-container p-6">
            <h2 className="text-2xl font-bold mb-4 cyber-text">For Security Researchers</h2>
            <ul className="space-y-3 font-mono">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Hunt for vulnerabilities in real-world applications</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Earn rewards for valid findings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Build your reputation in the security community</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Track your progress and achievements</span>
              </li>
            </ul>
          </div>
          
          <div className="cyber-container p-6">
            <h2 className="text-2xl font-bold mb-4 cyber-text">For Program Owners</h2>
            <ul className="space-y-3 font-mono">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Crowdsource security testing from skilled researchers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Pay only for valid vulnerability reports</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Improve your security posture continuously</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Set custom scopes and reward structures</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex space-x-4">
            <Link href="/auth">
              <a className="px-8 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-md transition-colors duration-300 inline-block">
                Get Started
              </a>
            </Link>
            <a 
              href="#features" 
              className="px-8 py-3 border border-green-500 hover:bg-green-900/30 text-green-500 font-bold rounded-md transition-colors duration-300 inline-block"
            >
              Learn More
            </a>
          </div>
        </div>
        
        <section id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-16 cyber-text">
            Platform Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="cyber-container p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Secure Reporting</h3>
              <p className="font-mono">
                End-to-end encrypted vulnerability reporting to protect sensitive information
              </p>
            </div>
            
            <div className="cyber-container p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Reputation System</h3>
              <p className="font-mono">
                Earn points and badges for quality reports and responsible disclosure
              </p>
            </div>
            
            <div className="cyber-container p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Real-time Updates</h3>
              <p className="font-mono">
                Get instant notifications about report status and reward payments
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <footer className="bg-black/80 py-8 relative z-10 border-t border-green-800 mt-20">
        <div className="container mx-auto px-4 text-center font-mono text-green-600">
          <p>© {new Date().getFullYear()} CyberHunt | The Ultimate Bug Bounty Platform</p>
        </div>
      </footer>
    </div>
  );
}