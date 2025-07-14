import { Link, Redirect } from "wouter";
import { ArrowRight, Shield, Bug, Trophy, Lock } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const { user } = useAuth();

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />

      {/* Header/Navigation */}
      <header className="relative z-10 border-b border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-matrix text-xl font-mono font-bold">CyberHunt_</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-dim-gray hover:text-matrix font-mono text-sm">Features</a>
              <a href="#how-it-works" className="text-dim-gray hover:text-matrix font-mono text-sm">How It Works</a>
              <a href="#programs" className="text-dim-gray hover:text-matrix font-mono text-sm">Programs</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 font-mono text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button className="glow-button font-mono text-sm">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-light-gray mb-6">
                <span className="text-matrix">Secure</span> the Digital Frontier
              </h1>
              <p className="text-dim-gray text-lg mb-8">
                Join the elite network of ethical hackers hunting for vulnerabilities and earning rewards 
                on the world's first truly immersive bug bounty platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button className="glow-button text-base font-mono py-6 px-8">
                    Start Hacking <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 text-base font-mono py-6 px-8">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="terminal-card p-8 rounded-lg border border-matrix/30 animate-pulse-glow">
              <div className="terminal-header mb-6"></div>
              <pre className="text-matrix font-mono text-sm">
                <code>
{`> initializing cyberhunt protocol
> scanning target_systems
> bypassing security.layer_1
> accessing_protected_data
> vulnerability.detected
> exploit.confirmed
> payout.initiated
> mission.complete`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Stripe */}
      <section className="relative z-10 bg-terminal border-y border-matrix/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">250+</p>
              <p className="text-dim-gray font-mono text-sm">Active Programs</p>
            </div>
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">$1.5M+</p>
              <p className="text-dim-gray font-mono text-sm">Paid Rewards</p>
            </div>
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">5,000+</p>
              <p className="text-dim-gray font-mono text-sm">Hackers</p>
            </div>
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">12,000+</p>
              <p className="text-dim-gray font-mono text-sm">Fixed Vulnerabilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Platform Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:animate-pulse-glow">
              <Shield className="text-matrix h-10 w-10 mb-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Secure Submission</h3>
              <p className="text-dim-gray">
                Submit vulnerabilities through our encrypted pipeline with advanced security measures to protect sensitive data.
              </p>
            </div>

            <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:animate-pulse-glow">
              <Bug className="text-matrix h-10 w-10 mb-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Intelligent Matching</h3>
              <p className="text-dim-gray">
                Our algorithm matches your skills with the right programs to maximize your success rate and earnings.
              </p>
            </div>

            <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:animate-pulse-glow">
              <Trophy className="text-matrix h-10 w-10 mb-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Fast Payouts</h3>
              <p className="text-dim-gray">
                Receive rewards quickly through multiple payout options, with the industry's fastest processing times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20 bg-terminal border-y border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">1</div>
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3 mt-2">Choose Program</h3>
              <p className="text-dim-gray">
                Browse available bug bounty programs and select those matching your expertise and interests.
              </p>
            </div>

            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">2</div>
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3 mt-2">Find Vulnerabilities</h3>
              <p className="text-dim-gray">
                Use your skills to identify security vulnerabilities within the scope of the program.
              </p>
            </div>

            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">3</div>
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3 mt-2">Submit & Get Paid</h3>
              <p className="text-dim-gray">
                Submit detailed reports through our platform and receive rewards for valid findings.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/auth">
              <Button className="glow-button text-base font-mono py-6 px-8">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section id="programs" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Featured Programs
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-12 w-12 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                  <span className="text-matrix font-mono text-lg">SC</span>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray">SecureCorp</h3>
                  <span className="text-xs font-mono bg-matrix/10 text-matrix px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
              <p className="text-sm text-dim-gray mb-4">Enterprise security solutions with critical infrastructure protection needs.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">Web</span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">API</span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">Mobile</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-dim-gray font-mono">Rewards: </span> 
                  <span className="text-xs text-warning-yellow font-mono">$500-$10,000</span>
                </div>
              </div>
            </div>

            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-12 w-12 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                  <span className="text-matrix font-mono text-lg">FN</span>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray">FinNet</h3>
                  <span className="text-xs font-mono bg-matrix/10 text-matrix px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
              <p className="text-sm text-dim-gray mb-4">Financial technology platform handling sensitive transaction data.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">Web</span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">API</span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">Network</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-dim-gray font-mono">Rewards: </span> 
                  <span className="text-xs text-warning-yellow font-mono">$1,000-$25,000</span>
                </div>
              </div>
            </div>

            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-12 w-12 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                  <span className="text-matrix font-mono text-lg">DT</span>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray">DataTrust</h3>
                  <span className="text-xs font-mono bg-matrix/10 text-matrix px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
              <p className="text-sm text-dim-gray mb-4">Cloud storage provider with emphasis on encrypted user data.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">Cloud</span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">API</span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-dim-gray font-mono">Web</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-dim-gray font-mono">Rewards: </span>
                  <span className="text-xs text-warning-yellow font-mono">$500-$15,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/auth?mode=register">
              <span className="text-matrix hover:text-matrix-dark text-sm font-mono cursor-pointer">
                View All Programs →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-black/50 border-y border-matrix/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lock className="text-matrix h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-mono font-bold text-light-gray mb-6">
            Ready to Join the Elite?
          </h2>
          <p className="text-dim-gray text-lg mb-8">
            Create your account today and start finding vulnerabilities that others miss. 
            Join thousands of ethical hackers making the digital world safer.
          </p>
          <Link href="/auth?mode=register">
            <Button className="glow-button text-base font-mono py-6 px-8">
              Create Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Resources Section */}
      <section className="relative z-10 py-20 bg-terminal border-y border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/documentation">
              <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:bg-surface/50 transition-all">
                <h3 className="text-xl font-mono text-matrix mb-4">Documentation</h3>
                <p className="text-dim-gray">Comprehensive guides and API references for using our platform.</p>
              </div>
            </Link>

            <Link href="/help-center">
              <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:bg-surface/50 transition-all">
                <h3 className="text-xl font-mono text-matrix mb-4">Help Center</h3>
                <p className="text-dim-gray">Get answers to common questions and learn how to use our features.</p>
              </div>
            </Link>

            <Link href="/blog">
              <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:bg-surface/50 transition-all">
                <h3 className="text-xl font-mono text-matrix mb-4">Blog</h3>
                <p className="text-dim-gray">Latest news, tutorials, and insights from our security experts.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Legal & About Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Legal & About
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/about">
              <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:bg-surface/50 transition-all">
                <h3 className="text-xl font-mono text-matrix mb-4">About Us</h3>
                <p className="text-dim-gray">Learn about our mission, team, and commitment to security.</p>
              </div>
            </Link>

            <Link href="/legal">
              <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:bg-surface/50 transition-all">
                <h3 className="text-xl font-mono text-matrix mb-4">Legal Information</h3>
                <p className="text-dim-gray">Important legal documents and compliance information.</p>
              </div>
            </Link>

            <Link href="/security">
              <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:bg-surface/50 transition-all">
                <h3 className="text-xl font-mono text-matrix mb-4">Security</h3>
                <p className="text-dim-gray">Our security practices and vulnerability disclosure policy.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-matrix text-xl font-mono font-bold">CyberHunt_</span>
              <p className="text-dim-gray text-sm mt-2">The elite bug bounty platform</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h4 className="text-light-gray font-mono text-sm mb-3">Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">About</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Programs</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Leaderboard</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-light-gray font-mono text-sm mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Help Center</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Blog</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-light-gray font-mono text-sm mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Privacy</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Terms</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-matrix/20 mt-8 pt-8 text-center">
            <p className="text-dim-gray text-xs font-mono">
              © {new Date().getFullYear()} CyberHunt. All rights reserved. <span className="text-matrix">|</span> Hack The Planet.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}