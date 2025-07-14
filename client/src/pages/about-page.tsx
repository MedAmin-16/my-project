import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { Shield, Globe, Terminal, Code, ChevronRight, Users, Award, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="terminal-card p-8 rounded-lg mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-mono font-bold text-matrix mb-4">About CyberHunt_</h1>
              <p className="text-dim-gray mb-6">
                Welcome to the next generation of bug bounty platforms. CyberHunt transforms vulnerability discovery 
                into an engaging, gamified experience for ethical hackers, focusing on interactive learning and 
                collaborative security exploration.
              </p>
              <Link href="/programs">
                <div className="inline-flex items-center px-4 py-2 border border-matrix bg-terminal rounded-md text-matrix hover:bg-matrix/10 transition duration-200 font-mono text-sm cursor-pointer">
                  Explore Programs <ChevronRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="glow-container w-64 h-64 relative">
                <div className="absolute inset-0 rounded-full bg-matrix/20 blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                  <Terminal className="h-16 w-16 text-matrix" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-spin-slow">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-matrix" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Code className="h-4 w-4 text-electric-blue" />
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mission Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Our Mission</h2>
          <div className="terminal-card p-6 rounded-lg">
            <p className="text-dim-gray mb-4">
              CyberHunt was founded with a single purpose: to transform the way security vulnerabilities are discovered 
              and reported. We believe that by creating an engaging, gamified platform, we can attract more talented 
              researchers to the field of cybersecurity and make the digital world safer for everyone.
            </p>
            <p className="text-dim-gray mb-4">
              We're committed to fostering a community of ethical hackers who are passionate about security, 
              and to providing organizations with a reliable way to identify and address vulnerabilities in 
              their systems before they can be exploited.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50 hover:bg-matrix/10 transition duration-200">
                <div className="flex items-center mb-3">
                  <Shield className="text-matrix mr-3 h-6 w-6" />
                  <h3 className="text-light-gray font-mono text-lg">Security First</h3>
                </div>
                <p className="text-dim-gray text-sm">
                  We prioritize responsible disclosure and ethical hacking principles in everything we do.
                </p>
              </div>
              <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50 hover:bg-matrix/10 transition duration-200">
                <div className="flex items-center mb-3">
                  <Users className="text-electric-blue mr-3 h-6 w-6" />
                  <h3 className="text-light-gray font-mono text-lg">Community Driven</h3>
                </div>
                <p className="text-dim-gray text-sm">
                  We believe in the power of collaboration and shared knowledge to advance security practices.
                </p>
              </div>
              <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50 hover:bg-matrix/10 transition duration-200">
                <div className="flex items-center mb-3">
                  <Award className="text-yellow-400 mr-3 h-6 w-6" />
                  <h3 className="text-light-gray font-mono text-lg">Recognition & Rewards</h3>
                </div>
                <p className="text-dim-gray text-sm">
                  We ensure that security researchers are properly recognized and rewarded for their contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Med Amin Ben Said",
                role: "Cybersecurity Specialist and CEO Founder CyberHunt",
                bio: "Leading cybersecurity expert and visionary founder of CyberHunt, dedicated to revolutionizing the bug bounty landscape.",
              }
            ].map((member, index) => (
              <div key={index} className="terminal-card p-5 rounded-lg hover:bg-matrix/5 transition-all duration-200">
                <h3 className="text-xl font-mono text-light-gray mb-1">{member.name}</h3>
                <p className="text-matrix text-sm mb-3">{member.role}</p>
                <p className="text-dim-gray text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Company Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">CyberHunt By The Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="terminal-card p-5 rounded-lg border border-matrix/30">
              <p className="text-4xl font-mono font-bold text-matrix mb-1">500+</p>
              <p className="text-dim-gray">Active Security Programs</p>
            </div>
            <div className="terminal-card p-5 rounded-lg border border-matrix/30">
              <p className="text-4xl font-mono font-bold text-electric-blue mb-1">10,000+</p>
              <p className="text-dim-gray">Ethical Hackers</p>
            </div>
            <div className="terminal-card p-5 rounded-lg border border-matrix/30">
              <p className="text-4xl font-mono font-bold text-green-500 mb-1">25,000+</p>
              <p className="text-dim-gray">Vulnerabilities Fixed</p>
            </div>
            <div className="terminal-card p-5 rounded-lg border border-matrix/30">
              <p className="text-4xl font-mono font-bold text-yellow-400 mb-1">$5M+</p>
              <p className="text-dim-gray">In Bounties Paid</p>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Our Journey</h2>
          <div className="terminal-card p-6 rounded-lg">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-matrix/30"></div>
              
              <div className="relative pl-12 pb-10">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-terminal border-2 border-matrix flex items-center justify-center">
                  <div className="w-3 h-3 bg-matrix rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray mb-1">2023</h3>
                  <p className="text-matrix mb-2">CyberHunt Founded</p>
                  <p className="text-dim-gray text-sm">
                    CyberHunt was established with the vision of creating a next-generation bug bounty platform 
                    that makes security research more accessible, engaging, and rewarding.
                  </p>
                </div>
              </div>
              
              <div className="relative pl-12 pb-10">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-terminal border-2 border-matrix flex items-center justify-center">
                  <div className="w-3 h-3 bg-matrix rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray mb-1">2023</h3>
                  <p className="text-matrix mb-2">Beta Launch</p>
                  <p className="text-dim-gray text-sm">
                    Released our beta platform to an initial group of security researchers and organizations, 
                    gathering feedback and refining our systems.
                  </p>
                </div>
              </div>
              
              <div className="relative pl-12 pb-10">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-terminal border-2 border-matrix flex items-center justify-center">
                  <div className="w-3 h-3 bg-matrix rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray mb-1">2024</h3>
                  <p className="text-matrix mb-2">Official Launch</p>
                  <p className="text-dim-gray text-sm">
                    CyberHunt officially launched to the public, introducing our gamified approach to bug bounties 
                    and our reputation-based system for researchers.
                  </p>
                </div>
              </div>
              
              <div className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-terminal border-2 border-matrix flex items-center justify-center">
                  <div className="w-3 h-3 bg-matrix rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-light-gray mb-1">2025</h3>
                  <p className="text-matrix mb-2">Growth & Expansion</p>
                  <p className="text-dim-gray text-sm">
                    Expanding our community to over 10,000 security researchers and partnering with major 
                    organizations to provide comprehensive vulnerability assessment programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="terminal-card p-8 rounded-lg text-center">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-4">Join the CyberHunt Community</h2>
          <p className="text-dim-gray mb-6 max-w-3xl mx-auto">
            Whether you're an experienced security researcher or just starting your journey in cybersecurity,
            CyberHunt offers opportunities to learn, grow, and earn rewards while making the digital world safer.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth?mode=register">
              <div className="px-6 py-3 bg-matrix text-black rounded-md font-mono hover:bg-matrix/80 transition duration-200 cursor-pointer">
                Create an Account
              </div>
            </Link>
            <Link href="/programs">
              <div className="px-6 py-3 border border-matrix text-matrix rounded-md font-mono hover:bg-matrix/10 transition duration-200 cursor-pointer">
                Browse Programs
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}