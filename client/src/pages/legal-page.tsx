import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { 
  FileText, 
  Shield, 
  Scale, 
  ExternalLink,
  Globe,
  Users,
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Legal & Company Information</h1>
          <p className="text-dim-gray">
            Important legal documents, company information, and contact details.
          </p>
        </div>
        
        <Tabs defaultValue="legal" className="w-full">
          <TabsList className="w-full border-b border-dark-terminal mb-6 bg-transparent h-auto p-0 justify-start">
            <TabsTrigger 
              value="legal" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              Legal Documents
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              About Us
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              Contact & Support
            </TabsTrigger>
          </TabsList>
          
          {/* Legal Documents Tab */}
          <TabsContent value="legal" className="p-0 mt-0">
            <div className="terminal-card p-6 rounded-lg mb-6">
              <h2 className="text-xl font-mono text-matrix mb-4">Important Legal Documents</h2>
              <p className="text-dim-gray mb-6">
                These documents govern your use of the CyberHunt platform and explain how we handle your data.
                Please review them carefully before using our services.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all">
                  <div className="flex items-start mb-3">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-matrix" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray">
                        <Link href="/terms-of-service">
                          Terms of Service
                        </Link>
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-dim-gray">
                    The agreement between you and CyberHunt that governs your use of our services.
                    These terms outline your rights, responsibilities, and our legal obligations.
                  </p>
                  <div className="mt-3">
                    <Link href="/terms-of-service">
                      <span className="text-xs text-matrix hover:text-matrix-dark font-mono cursor-pointer">View Terms of Service</span>
                    </Link>
                  </div>
                </div>
                
                <div className="p-5 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all">
                  <div className="flex items-start mb-3">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray">
                        <Link href="/privacy-policy">
                          Privacy Policy
                        </Link>
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-dim-gray">
                    This document explains how we collect, use, and protect your personal information,
                    and what rights you have regarding your data.
                  </p>
                  <div className="mt-3">
                    <Link href="/privacy-policy">
                      <span className="text-xs text-matrix hover:text-matrix-dark font-mono cursor-pointer">View Privacy Policy</span>
                    </Link>
                  </div>
                </div>
                
                <div className="p-5 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all">
                  <div className="flex items-start mb-3">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray">
                        <Link href="#">
                          Responsible Disclosure Policy
                        </Link>
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-dim-gray">
                    Guidelines for security researchers to responsibly disclose vulnerabilities in our platform,
                    and our commitment to addressing security issues.
                  </p>
                  <div className="mt-3">
                    <Link href="#">
                      <span className="text-xs text-matrix hover:text-matrix-dark font-mono cursor-pointer">View Disclosure Policy</span>
                    </Link>
                  </div>
                </div>
                
                <div className="p-5 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all">
                  <div className="flex items-start mb-3">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray">
                        <Link href="#">
                          Cookie Policy
                        </Link>
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-dim-gray">
                    Information about how we use cookies and similar technologies on our website,
                    and how you can control them.
                  </p>
                  <div className="mt-3">
                    <Link href="#">
                      <span className="text-xs text-matrix hover:text-matrix-dark font-mono cursor-pointer">View Cookie Policy</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="terminal-card p-6 rounded-lg">
              <h2 className="text-xl font-mono text-matrix mb-4">Additional Legal Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-dark-terminal rounded-lg">
                  <h3 className="text-md font-mono text-light-gray mb-2">GDPR Compliance</h3>
                  <p className="text-sm text-dim-gray">Information about our compliance with European data protection laws.</p>
                </div>
                
                <div className="p-4 border border-dark-terminal rounded-lg">
                  <h3 className="text-md font-mono text-light-gray mb-2">CCPA Compliance</h3>
                  <p className="text-sm text-dim-gray">Information about California consumer privacy rights and our compliance.</p>
                </div>
                
                <div className="p-4 border border-dark-terminal rounded-lg">
                  <h3 className="text-md font-mono text-light-gray mb-2">Licensing Information</h3>
                  <p className="text-sm text-dim-gray">Details about open source components used in our platform.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* About Us Tab */}
          <TabsContent value="about" className="p-0 mt-0">
            <div className="terminal-card p-6 rounded-lg mb-6">
              <h2 className="text-xl font-mono text-matrix mb-4">About CyberHunt</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-mono text-light-gray mb-3">Our Mission</h3>
                <p className="text-dim-gray">
                  CyberHunt is dedicated to making the digital world more secure by connecting ethical hackers with 
                  organizations seeking to improve their security posture. We believe in the power of community and 
                  collaboration to identify and resolve security vulnerabilities before they can be exploited.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-mono text-light-gray mb-3">Our Story</h3>
                <p className="text-dim-gray">
                  Founded in 2023 by a team of cybersecurity experts, CyberHunt emerged from the recognition that 
                  the traditional bug bounty model needed a refresh. We saw an opportunity to create a more engaging, 
                  gamified platform that rewards hackers not just financially, but through reputation, achievements, 
                  and skill development.
                </p>
                <p className="text-dim-gray mt-2">
                  Today, CyberHunt has grown into a thriving community of security researchers and organizations working 
                  together to strengthen online security and protect digital assets.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-mono text-light-gray mb-3">Our Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-dark-terminal rounded-lg">
                    <h4 className="text-md font-mono text-matrix mb-2">Integrity</h4>
                    <p className="text-sm text-dim-gray">
                      We believe in honest, ethical behavior and responsible disclosure practices. Trust is the 
                      foundation of everything we do.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-dark-terminal rounded-lg">
                    <h4 className="text-md font-mono text-matrix mb-2">Innovation</h4>
                    <p className="text-sm text-dim-gray">
                      We continuously push the boundaries of what's possible in vulnerability discovery and 
                      security research.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-dark-terminal rounded-lg">
                    <h4 className="text-md font-mono text-matrix mb-2">Community</h4>
                    <p className="text-sm text-dim-gray">
                      We foster a supportive environment where knowledge sharing and collaboration thrive.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Contact & Support Tab */}
          <TabsContent value="contact" className="p-0 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="terminal-card p-6 rounded-lg mb-6">
                  <h2 className="text-xl font-mono text-matrix mb-4">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-mono text-light-gray mb-3">General Inquiries</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-matrix mr-3" />
                          <span className="text-dim-gray">contact@thecyberhunt.com</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-matrix mr-3" />
                          <span className="text-dim-gray">+216 27580730</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-mono text-light-gray mb-3">Support</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-blue-400 mr-3" />
                          <span className="text-dim-gray">support@cyberhunt.com</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-blue-400 mr-3" />
                          <span className="text-dim-gray">+1 (555) 987-6543</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-mono text-light-gray mb-3">Mailing Address</h3>
                    <div className="flex">
                      <MapPin className="h-5 w-5 text-electric-blue mr-3 flex-shrink-0 mt-1" />
                      <address className="text-dim-gray not-italic">
                        CyberHunt, Inc.<br />
                        Tunisia
                      </address>
                    </div>
                  </div>
                </div>
                
                <div className="terminal-card p-6 rounded-lg">
                  <h2 className="text-xl font-mono text-matrix mb-4">Support Resources</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="#">
                      <div className="p-4 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all cursor-pointer">
                        <h3 className="text-md font-mono text-light-gray mb-2 flex items-center">
                          Knowledge Base
                          <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                        </h3>
                        <p className="text-sm text-dim-gray">
                          Browse our comprehensive documentation and guides.
                        </p>
                      </div>
                    </Link>
                    
                    <Link href="#">
                      <div className="p-4 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all cursor-pointer">
                        <h3 className="text-md font-mono text-light-gray mb-2 flex items-center">
                          FAQ
                          <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                        </h3>
                        <p className="text-sm text-dim-gray">
                          Find answers to commonly asked questions.
                        </p>
                      </div>
                    </Link>
                    
                    <Link href="#">
                      <div className="p-4 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all cursor-pointer">
                        <h3 className="text-md font-mono text-light-gray mb-2 flex items-center">
                          Submit a Ticket
                          <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                        </h3>
                        <p className="text-sm text-dim-gray">
                          Create a support ticket for technical assistance.
                        </p>
                      </div>
                    </Link>
                    
                    <Link href="#">
                      <div className="p-4 border border-dark-terminal rounded-lg hover:bg-dark-terminal/50 transition-all cursor-pointer">
                        <h3 className="text-md font-mono text-light-gray mb-2 flex items-center">
                          Live Chat
                          <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                        </h3>
                        <p className="text-sm text-dim-gray">
                          Chat with our support team during business hours.
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="terminal-card p-6 rounded-lg mb-6">
                  <h2 className="text-xl font-mono text-matrix mb-4">Business Hours</h2>
                  
                  <div className="space-y-3 text-dim-gray">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-dim-gray">
                    <p>Support tickets can be submitted 24/7.</p>
                    <p className="mt-2">Emergency security issues are responded to outside of business hours.</p>
                  </div>
                </div>
                
                <div className="terminal-card p-6 rounded-lg">
                  <h2 className="text-xl font-mono text-matrix mb-4">Connect With Us</h2>
                  
                  <div className="space-y-4">
                    <Link href="#">
                      <div className="flex items-center text-dim-gray hover:text-matrix transition-colors">
                        <Globe className="h-5 w-5 mr-3" />
                        <span>Twitter/X</span>
                      </div>
                    </Link>
                    
                    <Link href="#">
                      <div className="flex items-center text-dim-gray hover:text-matrix transition-colors">
                        <Globe className="h-5 w-5 mr-3" />
                        <span>LinkedIn</span>
                      </div>
                    </Link>
                    
                    <Link href="#">
                      <div className="flex items-center text-dim-gray hover:text-matrix transition-colors">
                        <Globe className="h-5 w-5 mr-3" />
                        <span>GitHub</span>
                      </div>
                    </Link>
                    
                    <Link href="#">
                      <div className="flex items-center text-dim-gray hover:text-matrix transition-colors">
                        <Globe className="h-5 w-5 mr-3" />
                        <span>YouTube</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}