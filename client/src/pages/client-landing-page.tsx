
import { Link, Redirect } from "wouter";
import { ArrowRight, Shield, Users, TrendingUp, Lock, CheckCircle, Star, Building2, Zap, Eye } from "lucide-react";
import MatrixBackground from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function ClientLandingPage() {
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
              <span className="text-dim-gray text-sm font-mono ml-2">For Organizations</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#security" className="text-dim-gray hover:text-matrix font-mono text-sm">Security</a>
              <a href="#pricing" className="text-dim-gray hover:text-matrix font-mono text-sm">Pricing</a>
              <a href="#testimonials" className="text-dim-gray hover:text-matrix font-mono text-sm">Case Studies</a>
              <a href="#contact" className="text-dim-gray hover:text-matrix font-mono text-sm">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 font-mono text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button className="glow-button font-mono text-sm">
                  Start Program
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
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-matrix/30 bg-matrix/10 mb-6">
                <Shield className="h-4 w-4 text-matrix mr-2" />
                <span className="text-matrix font-mono text-sm">Trusted by 500+ Organizations</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-light-gray mb-6">
                <span className="text-matrix">Secure</span> Your Digital Assets
              </h1>
              <p className="text-dim-gray text-lg mb-8">
                Partner with elite security researchers to identify vulnerabilities before attackers do. 
                Our platform connects you with vetted ethical hackers for comprehensive security testing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth?mode=register">
                  <Button className="glow-button text-base font-mono py-6 px-8">
                    Launch Bug Bounty <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 text-base font-mono py-6 px-8">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                  <span className="text-dim-gray font-mono">No Setup Costs</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                  <span className="text-dim-gray font-mono">Pay Only for Results</span>
                </div>
              </div>
            </div>
            <div className="terminal-card p-8 rounded-lg border border-matrix/30 animate-pulse-glow">
              <div className="terminal-header mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-matrix font-mono text-sm">Security Dashboard</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-dim-gray font-mono text-sm">Critical Issues Found:</span>
                  <span className="text-red-400 font-mono">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim-gray font-mono text-sm">High Priority:</span>
                  <span className="text-orange-400 font-mono">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dim-gray font-mono text-sm">Medium Priority:</span>
                  <span className="text-yellow-400 font-mono">28</span>
                </div>
                <div className="w-full bg-terminal rounded-full h-2 mt-4">
                  <div className="bg-matrix h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
                <div className="text-center">
                  <span className="text-matrix font-mono text-sm">Security Score: 78/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative z-10 bg-terminal border-y border-matrix/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">99.9%</p>
              <p className="text-dim-gray font-mono text-sm">Uptime SLA</p>
            </div>
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">15k+</p>
              <p className="text-dim-gray font-mono text-sm">Vulnerabilities Fixed</p>
            </div>
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">72hrs</p>
              <p className="text-dim-gray font-mono text-sm">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-matrix font-mono text-2xl md:text-3xl font-bold">SOC2</p>
              <p className="text-dim-gray font-mono text-sm">Compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section id="security" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Why Organizations Trust CyberHunt
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:animate-pulse-glow">
              <Users className="text-matrix h-10 w-10 mb-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Elite Researcher Network</h3>
              <p className="text-dim-gray mb-4">
                Access to 5,000+ vetted security researchers with proven track records and specialized expertise across all technology stacks.
              </p>
              <ul className="text-sm text-dim-gray space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />Background verified</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />Skill-based matching</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />Reputation scoring</li>
              </ul>
            </div>

            <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:animate-pulse-glow">
              <TrendingUp className="text-matrix h-10 w-10 mb-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Cost-Effective Security</h3>
              <p className="text-dim-gray mb-4">
                Save up to 70% compared to traditional penetration testing while getting continuous security assessment and faster vulnerability discovery.
              </p>
              <ul className="text-sm text-dim-gray space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />Pay-per-vulnerability model</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />No upfront costs</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />Flexible budgeting</li>
              </ul>
            </div>

            <div className="terminal-card p-6 rounded-lg border border-matrix/30 hover:animate-pulse-glow">
              <Lock className="text-matrix h-10 w-10 mb-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Enterprise Security</h3>
              <p className="text-dim-gray mb-4">
                Bank-grade security infrastructure with SOC 2 compliance, encrypted communications, and comprehensive audit trails for enterprise peace of mind.
              </p>
              <ul className="text-sm text-dim-gray space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />End-to-end encryption</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />NDAs & legal protection</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-2" />Compliance ready</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative z-10 py-20 bg-terminal border-y border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">1</div>
              <Building2 className="text-matrix h-8 w-8 mb-4 mt-2" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Setup Program</h3>
              <p className="text-dim-gray text-sm">
                Define your scope, set reward ranges, and configure program parameters. Our team helps optimize your program for maximum effectiveness.
              </p>
            </div>

            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">2</div>
              <Users className="text-matrix h-8 w-8 mb-4 mt-2" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Researcher Matching</h3>
              <p className="text-dim-gray text-sm">
                Our AI matches your program with researchers who have relevant skills and experience in your technology stack and industry.
              </p>
            </div>

            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">3</div>
              <Eye className="text-matrix h-8 w-8 mb-4 mt-2" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Continuous Testing</h3>
              <p className="text-dim-gray text-sm">
                Researchers continuously test your applications and submit detailed vulnerability reports with proof-of-concept and remediation guidance.
              </p>
            </div>

            <div className="bg-black/50 p-6 rounded-lg border border-matrix/20 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix font-mono text-matrix">4</div>
              <Zap className="text-matrix h-8 w-8 mb-4 mt-2" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-3">Fast Remediation</h3>
              <p className="text-dim-gray text-sm">
                Get actionable reports, track fix progress, and verify remediation. Our platform streamlines the entire vulnerability lifecycle management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Transparent Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="terminal-card p-8 rounded-lg border border-matrix/30">
              <h3 className="text-2xl font-mono text-light-gray mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-3xl font-mono text-matrix">20%</span>
                <span className="text-dim-gray"> platform fee</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Up to 50 researchers</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Basic dashboard</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Email support</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Standard SLA</span>
                </li>
              </ul>
              <Button className="w-full border border-matrix/50 text-matrix hover:bg-matrix/10" variant="outline">
                Start Free Trial
              </Button>
            </div>

            <div className="terminal-card p-8 rounded-lg border border-matrix animate-pulse-glow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-matrix text-black px-3 py-1 rounded-full text-xs font-mono">Popular</span>
              </div>
              <h3 className="text-2xl font-mono text-light-gray mb-4">Professional</h3>
              <div className="mb-6">
                <span className="text-3xl font-mono text-matrix">15%</span>
                <span className="text-dim-gray"> platform fee</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Up to 200 researchers</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Priority support</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">API access</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Custom integrations</span>
                </li>
              </ul>
              <Button className="w-full glow-button">
                Get Started
              </Button>
            </div>

            <div className="terminal-card p-8 rounded-lg border border-matrix/30">
              <h3 className="text-2xl font-mono text-light-gray mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-3xl font-mono text-matrix">Custom</span>
                <span className="text-dim-gray"> pricing</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Unlimited researchers</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Dedicated support</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">Custom workflows</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">SOC 2 compliance</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3" />
                  <span className="font-mono text-sm">On-premise deployment</span>
                </li>
              </ul>
              <Button className="w-full border border-matrix/50 text-matrix hover:bg-matrix/10" variant="outline">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-20 bg-terminal border-y border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-mono font-bold text-light-gray text-center mb-12">
            <span className="text-matrix">_</span> Trusted by Industry Leaders
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black/50 p-8 rounded-lg border border-matrix/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-dim-gray mb-6 italic">
                "CyberHunt helped us identify critical vulnerabilities that our internal team missed. 
                The quality of researchers and speed of response exceeded our expectations."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-matrix/20 flex items-center justify-center mr-4">
                  <span className="text-matrix font-mono">JS</span>
                </div>
                <div>
                  <p className="text-light-gray font-mono">John Smith</p>
                  <p className="text-dim-gray text-sm">CISO, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="bg-black/50 p-8 rounded-lg border border-matrix/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-dim-gray mb-6 italic">
                "The cost savings compared to traditional pen testing are incredible. We now have 
                continuous security testing at a fraction of the cost."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-matrix/20 flex items-center justify-center mr-4">
                  <span className="text-matrix font-mono">MJ</span>
                </div>
                <div>
                  <p className="text-light-gray font-mono">Maria Johnson</p>
                  <p className="text-dim-gray text-sm">Security Director, FinanceApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative z-10 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="text-matrix h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-mono font-bold text-light-gray mb-6">
            Ready to Strengthen Your Security?
          </h2>
          <p className="text-dim-gray text-lg mb-8">
            Join hundreds of organizations that trust CyberHunt to protect their digital assets. 
            Start your bug bounty program today and discover vulnerabilities before attackers do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register">
              <Button className="glow-button text-base font-mono py-6 px-8">
                Start Your Program <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 text-base font-mono py-6 px-8">
              Schedule Demo
            </Button>
          </div>
          <p className="text-dim-gray text-sm mt-6 font-mono">
            No setup fees • Pay only for results • 30-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-matrix text-xl font-mono font-bold">CyberHunt_</span>
              <p className="text-dim-gray text-sm mt-2">Enterprise Security Solutions</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h4 className="text-light-gray font-mono text-sm mb-3">Solutions</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Bug Bounty</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Pen Testing</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Compliance</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-light-gray font-mono text-sm mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Case Studies</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Security Blog</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-light-gray font-mono text-sm mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">About</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Careers</a></li>
                  <li><a href="#" className="text-dim-gray hover:text-matrix text-xs font-mono">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-matrix/20 mt-8 pt-8 text-center">
            <p className="text-dim-gray text-xs font-mono">
              © {new Date().getFullYear()} CyberHunt. All rights reserved. <span className="text-matrix">|</span> Secure by Design.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
