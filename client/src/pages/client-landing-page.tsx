
import { Link, Redirect } from "wouter";
import { ArrowRight, Shield, Users, TrendingUp, Lock, CheckCircle, Star, Building2, Zap, Eye, Clock, Award, Globe, FileText, ChevronRight, Monitor, Database, Bot } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function ClientLandingPage() {
  const { user } = useAuth();

  // Allow both logged-in and non-logged-in users to access this page
  // Removed automatic redirect to dashboard

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />

      {/* Header/Navigation */}
      <header className="relative z-10 border-b border-matrix/30 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-matrix text-xl font-mono font-bold">CyberHunt_</span>
              <span className="text-dim-gray text-sm font-mono ml-2">Enterprise Security</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#security" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Security</a>
              <a href="#features" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Features</a>
              <a href="#pricing" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Pricing</a>
              <a href="#testimonials" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Case Studies</a>
              <a href="#contact" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 font-mono text-sm transition-all">
                  Login
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button className="glow-button font-mono text-sm">
                  Start Security Program
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-matrix/30 bg-matrix/10 mb-8">
                <Shield className="h-4 w-4 text-matrix mr-2" />
                <span className="text-matrix font-mono text-sm">Next-Gen Security Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-light-gray mb-8 leading-tight">
                <span className="text-matrix">Fortify</span> Your Digital Infrastructure
              </h1>
              <p className="text-dim-gray text-xl mb-10 leading-relaxed">
                Connect with the world's elite security researchers to identify vulnerabilities before attackers do. 
                Our platform transforms cybersecurity from reactive defense to proactive protection.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                <Link href="/auth?mode=register">
                  <Button className="glow-button text-lg font-mono py-8 px-10 rounded-lg">
                    Launch Security Program <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 text-lg font-mono py-8 px-10 rounded-lg transition-all">
                    Request Demo
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3" />
                  <span className="text-dim-gray font-mono">Zero Setup Costs</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3" />
                  <span className="text-dim-gray font-mono">Pay Only for Results</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3" />
                  <span className="text-dim-gray font-mono">24/7 Security Coverage</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3" />
                  <span className="text-dim-gray font-mono">Enterprise Grade</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="terminal-card p-10 rounded-xl border border-matrix/30 animate-pulse-glow">
                <div className="terminal-header mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-matrix font-mono text-lg">Security Command Center</span>
                    <div className="flex space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-dim-gray font-mono">Critical Vulnerabilities:</span>
                    <span className="text-red-400 font-mono text-lg font-bold">0</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-dim-gray font-mono">High Priority:</span>
                    <span className="text-orange-400 font-mono text-lg font-bold">2</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-dim-gray font-mono">Medium Priority:</span>
                    <span className="text-yellow-400 font-mono text-lg font-bold">7</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-dim-gray font-mono">Researchers Active:</span>
                    <span className="text-matrix font-mono text-lg font-bold">23</span>
                  </div>
                  <div className="w-full bg-terminal rounded-full h-3 mt-6">
                    <div className="bg-gradient-to-r from-matrix to-green-400 h-3 rounded-full transition-all duration-1000" style={{width: '94%'}}></div>
                  </div>
                  <div className="text-center pt-2">
                    <span className="text-matrix font-mono text-lg font-bold">Security Score: 94/100</span>
                    <p className="text-dim-gray font-mono text-sm mt-1">Excellent Protection</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix animate-pulse">
                <Shield className="h-8 w-8 text-matrix" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative z-10 bg-gradient-to-r from-terminal to-black border-y border-matrix/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-dim-gray font-mono text-lg">Trusted by leading organizations worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="mb-4">
                <Globe className="h-8 w-8 text-matrix mx-auto" />
              </div>
              <p className="text-matrix font-mono text-3xl md:text-4xl font-bold mb-2">99.9%</p>
              <p className="text-dim-gray font-mono text-sm">Uptime SLA Guarantee</p>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <Clock className="h-8 w-8 text-matrix mx-auto" />
              </div>
              <p className="text-matrix font-mono text-3xl md:text-4xl font-bold mb-2">&lt;2hrs</p>
              <p className="text-dim-gray font-mono text-sm">Average Response Time</p>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <Award className="h-8 w-8 text-matrix mx-auto" />
              </div>
              <p className="text-matrix font-mono text-3xl md:text-4xl font-bold mb-2">SOC2</p>
              <p className="text-dim-gray font-mono text-sm">Type II Certified</p>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <Users className="h-8 w-8 text-matrix mx-auto" />
              </div>
              <p className="text-matrix font-mono text-3xl md:text-4xl font-bold mb-2">10K+</p>
              <p className="text-dim-gray font-mono text-sm">Verified Researchers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-mono font-bold text-light-gray mb-6">
              <span className="text-matrix">_</span> Platform Capabilities
            </h2>
            <p className="text-dim-gray text-xl max-w-3xl mx-auto">
              Comprehensive security testing platform designed for modern enterprises
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="terminal-card p-8 rounded-xl border border-matrix/30 hover:animate-pulse-glow group">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 group-hover:bg-matrix/20 transition-all">
                  <Bot className="text-matrix h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-mono font-bold text-light-gray mb-4">AI-Powered Triage</h3>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Advanced AI automatically validates, prioritizes, and routes vulnerability reports, reducing false positives by 85% and accelerating response times.
              </p>
              <ul className="text-sm text-dim-gray space-y-3">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Automated duplicate detection</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Smart severity assessment</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Context-aware routing</li>
              </ul>
            </div>

            <div className="terminal-card p-8 rounded-xl border border-matrix/30 hover:animate-pulse-glow group">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 group-hover:bg-matrix/20 transition-all">
                  <Users className="text-matrix h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-mono font-bold text-light-gray mb-4">Elite Researcher Network</h3>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Access our curated network of top-tier security researchers, each vetted through rigorous background checks and skill assessments.
              </p>
              <ul className="text-sm text-dim-gray space-y-3">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Multi-layer verification process</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Specialized expertise matching</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Performance-based reputation</li>
              </ul>
            </div>

            <div className="terminal-card p-8 rounded-xl border border-matrix/30 hover:animate-pulse-glow group">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 group-hover:bg-matrix/20 transition-all">
                  <Monitor className="text-matrix h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-mono font-bold text-light-gray mb-4">Real-Time Monitoring</h3>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Comprehensive dashboard providing real-time insights into your security posture with customizable alerts and detailed analytics.
              </p>
              <ul className="text-sm text-dim-gray space-y-3">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Live threat visualization</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Custom alert rules</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Executive reporting</li>
              </ul>
            </div>

            <div className="terminal-card p-8 rounded-xl border border-matrix/30 hover:animate-pulse-glow group">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 group-hover:bg-matrix/20 transition-all">
                  <Database className="text-matrix h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-mono font-bold text-light-gray mb-4">Enterprise Integrations</h3>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Seamlessly integrate with your existing security tools and workflows through our comprehensive API and pre-built connectors.
              </p>
              <ul className="text-sm text-dim-gray space-y-3">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />SIEM/SOAR integration</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Ticketing system sync</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />CI/CD pipeline hooks</li>
              </ul>
            </div>

            <div className="terminal-card p-8 rounded-xl border border-matrix/30 hover:animate-pulse-glow group">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 group-hover:bg-matrix/20 transition-all">
                  <Lock className="text-matrix h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-mono font-bold text-light-gray mb-4">Zero Trust Security</h3>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Bank-grade security infrastructure with end-to-end encryption, multi-factor authentication, and complete audit trails.
              </p>
              <ul className="text-sm text-dim-gray space-y-3">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />AES-256 encryption</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Zero-knowledge architecture</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Immutable audit logs</li>
              </ul>
            </div>

            <div className="terminal-card p-8 rounded-xl border border-matrix/30 hover:animate-pulse-glow group">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 group-hover:bg-matrix/20 transition-all">
                  <TrendingUp className="text-matrix h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-mono font-bold text-light-gray mb-4">Cost Optimization</h3>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Reduce security testing costs by up to 75% with our efficient pay-per-vulnerability model and automated workflows.
              </p>
              <ul className="text-sm text-dim-gray space-y-3">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Transparent pricing model</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />Budget controls</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-matrix mr-3" />ROI analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-terminal to-black border-y border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-mono font-bold text-light-gray mb-6">
              <span className="text-matrix">_</span> How It Works
            </h2>
            <p className="text-dim-gray text-xl max-w-3xl mx-auto">
              Simple, streamlined process to get your security program up and running
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-black/60 p-8 rounded-xl border border-matrix/20 relative backdrop-blur-sm">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-matrix/20 flex items-center justify-center border-2 border-matrix font-mono text-matrix text-lg font-bold">1</div>
              <Building2 className="text-matrix h-10 w-10 mb-6 mt-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-4">Program Setup</h3>
              <p className="text-dim-gray text-sm leading-relaxed">
                Define your scope, set reward parameters, and configure program rules. Our experts help optimize your program for maximum effectiveness and researcher engagement.
              </p>
            </div>

            <div className="bg-black/60 p-8 rounded-xl border border-matrix/20 relative backdrop-blur-sm">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-matrix/20 flex items-center justify-center border-2 border-matrix font-mono text-matrix text-lg font-bold">2</div>
              <Users className="text-matrix h-10 w-10 mb-6 mt-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-4">AI Matching</h3>
              <p className="text-dim-gray text-sm leading-relaxed">
                Our advanced AI matches your program with researchers who have proven expertise in your technology stack, industry vertical, and specific security domains.
              </p>
            </div>

            <div className="bg-black/60 p-8 rounded-xl border border-matrix/20 relative backdrop-blur-sm">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-matrix/20 flex items-center justify-center border-2 border-matrix font-mono text-matrix text-lg font-bold">3</div>
              <Eye className="text-matrix h-10 w-10 mb-6 mt-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-4">Continuous Testing</h3>
              <p className="text-dim-gray text-sm leading-relaxed">
                Elite researchers continuously test your applications, submitting detailed vulnerability reports with proof-of-concept exploits and comprehensive remediation guidance.
              </p>
            </div>

            <div className="bg-black/60 p-8 rounded-xl border border-matrix/20 relative backdrop-blur-sm">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-matrix/20 flex items-center justify-center border-2 border-matrix font-mono text-matrix text-lg font-bold">4</div>
              <Zap className="text-matrix h-10 w-10 mb-6 mt-4" />
              <h3 className="text-xl font-mono font-bold text-light-gray mb-4">Rapid Response</h3>
              <p className="text-dim-gray text-sm leading-relaxed">
                Receive actionable reports, track remediation progress, and verify fixes. Our platform streamlines the entire vulnerability lifecycle with automated workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Pricing Transparency */}
      <section className="relative z-10 py-16 bg-gradient-to-r from-matrix/10 to-green-400/10 border-y border-matrix/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-mono font-bold text-light-gray mb-4">
              <span className="text-matrix">How CyberHunt Works</span>
            </h2>
            <p className="text-xl text-matrix font-mono font-bold mb-2">
              100% FREE for Organizations
            </p>
            <p className="text-dim-gray text-lg">
              No upfront fees. No subscriptions. Just results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-matrix/20 flex items-center justify-center mx-auto mb-4 border-2 border-matrix">
                <span className="text-matrix font-mono text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-mono text-light-gray mb-3">Setup Your Program</h3>
              <p className="text-dim-gray">
                Launch your bug bounty program in minutes. Define scope, set rewards - completely free.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-matrix/20 flex items-center justify-center mx-auto mb-4 border-2 border-matrix">
                <span className="text-matrix font-mono text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-mono text-light-gray mb-3">Researchers Find Bugs</h3>
              <p className="text-dim-gray">
                Elite security researchers test your systems and submit verified vulnerability reports.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-matrix/20 flex items-center justify-center mx-auto mb-4 border-2 border-matrix">
                <span className="text-matrix font-mono text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-mono text-light-gray mb-3">Pay Only for Results</h3>
              <p className="text-dim-gray">
                Pay rewards only when valid vulnerabilities are discovered. We earn a small commission from successful findings.
              </p>
            </div>
          </div>

          <div className="terminal-card p-8 rounded-xl border border-matrix/30 bg-black/60 backdrop-blur-sm max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-mono text-matrix font-bold mb-2">Transparent Cost Structure</h3>
              <p className="text-dim-gray">Our revenue model aligns with your success</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-mono text-matrix font-bold mb-2">$0</div>
                <p className="text-light-gray font-mono text-lg mb-2">Setup & Monthly Fees</p>
                <p className="text-dim-gray text-sm">No hidden costs, no subscriptions</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-mono text-matrix font-bold mb-2">15-20%</div>
                <p className="text-light-gray font-mono text-lg mb-2">Our Commission</p>
                <p className="text-dim-gray text-sm">Only earned when vulnerabilities are found</p>
              </div>
            </div>


          </div>
        </div>
      </section>



      {/* Managed Vulnerability Program Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-terminal to-black border-y border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-mono font-bold text-light-gray mb-6">
              🔐 <span className="text-matrix">Enterprise Vulnerability Management</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-dim-gray text-xl mb-8">
                Our managed triage and enterprise support service is available through flexible pricing plans:
              </p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Per-Report Plan */}
            <div className="terminal-card p-8 rounded-xl border border-matrix/30 bg-black/60 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-matrix/10 flex items-center justify-center mx-auto mb-4 border border-matrix/30">
                  <span className="text-matrix font-mono text-2xl font-bold">•</span>
                </div>
                <h3 className="text-2xl font-mono text-light-gray font-bold mb-2">Per-Report Plan</h3>
                <div className="text-4xl font-mono text-matrix font-bold mb-2">$150</div>
                <p className="text-dim-gray text-sm">per report</p>
              </div>
              <p className="text-dim-gray text-center mb-6">
                Ideal for companies with occasional submissions.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Professional triage per report</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Detailed vulnerability assessment</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">AI-powered validation</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Standard reporting</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-matrix/50 text-matrix hover:bg-matrix/10 font-mono py-3">
                Get Started
              </Button>
            </div>

            {/* Monthly Plan */}
            <div className="terminal-card p-8 rounded-xl border-2 border-matrix bg-gradient-to-br from-matrix/10 to-green-400/10 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-matrix text-black px-4 py-1 rounded-full text-sm font-mono font-bold">
                  POPULAR
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-matrix/20 flex items-center justify-center mx-auto mb-4 border-2 border-matrix">
                  <span className="text-matrix font-mono text-2xl font-bold">•</span>
                </div>
                <h3 className="text-2xl font-mono text-light-gray font-bold mb-2">Monthly Plan</h3>
                <div className="text-4xl font-mono text-matrix font-bold mb-2">$2,999</div>
                <p className="text-dim-gray text-sm">per month</p>
              </div>
              <p className="text-dim-gray text-center mb-6">
                Unlimited triage reports + Dedicated security analyst.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Unlimited vulnerability triage</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Dedicated security analyst</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">24/7 monitoring & response</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Advanced AI triage</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Monthly security reports</span>
                </li>
              </ul>
              <Button className="w-full glow-button font-mono py-3">
                Start Monthly Plan
              </Button>
            </div>

            {/* Annual Plan */}
            <div className="terminal-card p-8 rounded-xl border border-matrix/30 bg-black/60 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-matrix/10 flex items-center justify-center mx-auto mb-4 border border-matrix/30">
                  <span className="text-matrix font-mono text-2xl font-bold">•</span>
                </div>
                <h3 className="text-2xl font-mono text-light-gray font-bold mb-2">Annual Plan</h3>
                <div className="text-4xl font-mono text-matrix font-bold mb-2">$29,990</div>
                <p className="text-dim-gray text-sm">per year</p>
                <div className="text-green-400 text-sm font-mono mt-1">Save $6,000/year</div>
              </div>
              <p className="text-dim-gray text-center mb-6">
                All monthly features + SLA-backed response times + Priority triage + Custom reporting.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Everything in Monthly Plan</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">SLA-backed response times</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Priority triage queue</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Custom reporting & analytics</span>
                </li>
                <li className="flex items-center text-dim-gray">
                  <CheckCircle className="h-4 w-4 text-matrix mr-3 flex-shrink-0" />
                  <span className="text-sm">Dedicated account manager</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-matrix/50 text-matrix hover:bg-matrix/10 font-mono py-3">
                Choose Annual
              </Button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Link href="/auth?mode=register">
              <Button className="glow-button text-xl font-mono py-6 px-12 rounded-lg mb-4">
                Start a Free Consultation <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <p className="text-dim-gray text-sm">
              Free 30-minute security assessment • No commitment required • Custom enterprise solutions available
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative z-10 py-16 bg-gradient-to-b from-black to-terminal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-matrix/10 flex items-center justify-center mx-auto mb-4 border border-matrix/30">
                <TrendingUp className="h-8 w-8 text-matrix" />
              </div>
              <h3 className="text-xl font-mono text-light-gray mb-3">75% Cost Reduction</h3>
              <p className="text-dim-gray">
                Significantly lower costs compared to traditional penetration testing while providing continuous coverage.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-matrix/10 flex items-center justify-center mx-auto mb-4 border border-matrix/30">
                <Clock className="h-8 w-8 text-matrix" />
              </div>
              <h3 className="text-xl font-mono text-light-gray mb-3">2-Hour Response Time</h3>
              <p className="text-dim-gray">
                Critical vulnerabilities are triaged and escalated to your team within 2 hours of discovery.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-matrix/10 flex items-center justify-center mx-auto mb-4 border border-matrix/30">
                <Users className="h-8 w-8 text-matrix" />
              </div>
              <h3 className="text-xl font-mono text-light-gray mb-3">Elite Researcher Network</h3>
              <p className="text-dim-gray">
                Access to 10,000+ vetted security researchers with specialized expertise in your technology stack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section id="contact" className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Shield className="text-matrix h-16 w-16 mx-auto mb-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-light-gray mb-8">
            Ready to Transform Your Security?
          </h2>
          <p className="text-dim-gray text-xl mb-12 leading-relaxed max-w-3xl mx-auto">
            Join the ranks of forward-thinking organizations using next-generation security testing. 
            Launch your program today and discover vulnerabilities before attackers do.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/auth?mode=register">
              <Button className="glow-button text-xl font-mono py-8 px-12 rounded-lg">
                Launch Security Program <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button variant="outline" className="border-matrix/50 text-matrix hover:bg-matrix/10 text-xl font-mono py-8 px-12 rounded-lg transition-all">
              Schedule Demo
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-matrix mr-3" />
              <span className="text-dim-gray font-mono">30-day free trial</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-matrix mr-3" />
              <span className="text-dim-gray font-mono">No setup fees</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-matrix mr-3" />
              <span className="text-dim-gray font-mono">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-16 border-t border-matrix/30 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className="text-matrix text-2xl font-mono font-bold">CyberHunt_</span>
                <p className="text-dim-gray text-lg mt-3">Enterprise Security Solutions</p>
              </div>
              <p className="text-dim-gray mb-6 leading-relaxed">
                Transforming cybersecurity through elite researcher networks and 
                AI-powered vulnerability discovery for modern enterprises.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 hover:bg-matrix/20 transition-all">
                  <span className="text-matrix font-mono text-sm">in</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 hover:bg-matrix/20 transition-all">
                  <span className="text-matrix font-mono text-sm">tw</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-matrix/10 flex items-center justify-center border border-matrix/30 hover:bg-matrix/20 transition-all">
                  <span className="text-matrix font-mono text-sm">gh</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-light-gray font-mono text-lg mb-6">Solutions</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Bug Bounty Programs</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Penetration Testing</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Compliance Testing</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Red Team Exercises</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-light-gray font-mono text-lg mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Security Blog</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Security Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-light-gray font-mono text-lg mb-6">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">About Us</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Careers</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Contact Sales</a></li>
                <li><a href="#" className="text-dim-gray hover:text-matrix font-mono text-sm transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-matrix/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-dim-gray text-sm font-mono mb-4 md:mb-0">
                © {new Date().getFullYear()} CyberHunt. All rights reserved. <span className="text-matrix">|</span> Secure by Design.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-dim-gray hover:text-matrix text-sm font-mono transition-colors">Privacy Policy</a>
                <a href="#" className="text-dim-gray hover:text-matrix text-sm font-mono transition-colors">Terms of Service</a>
                <a href="#" className="text-dim-gray hover:text-matrix text-sm font-mono transition-colors">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
