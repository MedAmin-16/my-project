import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  Shield,
  Lock,
  Eye,
  Key,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Fingerprint,
  HardDrive,
  Network,
  Server,
  Globe,
  Mail,
  ChevronRight
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="terminal-card p-8 rounded-lg mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-mono font-bold text-matrix mb-4">Security at CyberHunt</h1>
              <p className="text-dim-gray mb-6">
                As a platform dedicated to cybersecurity, we take the security of our own systems 
                and your data extremely seriously. Learn about our comprehensive security measures, 
                vulnerability disclosure policy, and commitment to protecting our community.
              </p>
              <Link href="/auth?mode=register">
                <a className="inline-flex items-center px-4 py-2 border border-matrix bg-terminal rounded-md text-matrix hover:bg-matrix/10 transition duration-200 font-mono text-sm">
                  Join Our Security Community <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="glow-container w-64 h-64 relative">
                <div className="absolute inset-0 rounded-full bg-matrix/20 blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                  <Shield className="h-16 w-16 text-matrix" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-spin-slow">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-matrix" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Key className="h-4 w-4 text-electric-blue" />
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Measures Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Our Security Measures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 flex-shrink-0 bg-terminal border border-matrix/30 rounded-md flex items-center justify-center mr-4">
                  <Lock className="h-5 w-5 text-matrix" />
                </div>
                <div>
                  <h3 className="text-xl font-mono text-light-gray mb-2">Access Control</h3>
                  <p className="text-dim-gray text-sm">
                    We implement strict access controls using a principle of least privilege. Our systems
                    utilize multi-factor authentication, role-based access control, and detailed audit
                    logging to ensure only authorized personnel can access sensitive systems.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-dim-gray text-sm pl-14">
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                  <span>Multi-factor authentication for all internal systems</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                  <span>Granular permissions with regular access reviews</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                  <span>IP-based access restrictions for administrative functions</span>
                </li>
              </ul>
            </div>
            
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 flex-shrink-0 bg-terminal border border-matrix/30 rounded-md flex items-center justify-center mr-4">
                  <Fingerprint className="h-5 w-5 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-mono text-light-gray mb-2">Authentication</h3>
                  <p className="text-dim-gray text-sm">
                    User authentication is secured through industry-best practices including strong password
                    policies, multi-factor authentication options, and secure session management.
                    We never store plaintext passwords and use modern hashing algorithms.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-dim-gray text-sm pl-14">
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-electric-blue mr-2 mt-0.5 flex-shrink-0" />
                  <span>TOTP-based multi-factor authentication support</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-electric-blue mr-2 mt-0.5 flex-shrink-0" />
                  <span>OWASP-compliant password policy requirements</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-electric-blue mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rate-limiting and brute force protection</span>
                </li>
              </ul>
            </div>
            
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 flex-shrink-0 bg-terminal border border-matrix/30 rounded-md flex items-center justify-center mr-4">
                  <HardDrive className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-mono text-light-gray mb-2">Data Protection</h3>
                  <p className="text-dim-gray text-sm">
                    All sensitive data is encrypted both in transit and at rest. We use industry-standard
                    encryption protocols and algorithms. Database backups are encrypted and securely stored
                    with strict retention policies and access controls.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-dim-gray text-sm pl-14">
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>TLS 1.3 for all data in transit</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>AES-256 encryption for data at rest</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Regular data protection audits and assessments</span>
                </li>
              </ul>
            </div>
            
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 flex-shrink-0 bg-terminal border border-matrix/30 rounded-md flex items-center justify-center mr-4">
                  <Network className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-mono text-light-gray mb-2">Network Security</h3>
                  <p className="text-dim-gray text-sm">
                    Our infrastructure is protected by multiple layers of network security including
                    firewalls, intrusion detection systems, and regular penetration testing.
                    Network traffic is monitored 24/7 for suspicious activity.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-dim-gray text-sm pl-14">
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Web Application Firewall (WAF) protection</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>DDoS mitigation systems</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Real-time threat intelligence integration</span>
                </li>
              </ul>
            </div>
            
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 flex-shrink-0 bg-terminal border border-matrix/30 rounded-md flex items-center justify-center mr-4">
                  <Server className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-mono text-light-gray mb-2">Infrastructure Security</h3>
                  <p className="text-dim-gray text-sm">
                    Our systems are continuously patched and maintained with the latest security updates.
                    We employ infrastructure-as-code practices with security controls and compliance
                    checks built into our CI/CD pipelines.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-dim-gray text-sm pl-14">
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Automated vulnerability scanning and patching</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Container security and image scanning</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Immutable infrastructure patterns</span>
                </li>
              </ul>
            </div>
            
            <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 flex-shrink-0 bg-terminal border border-matrix/30 rounded-md flex items-center justify-center mr-4">
                  <Globe className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-mono text-light-gray mb-2">Application Security</h3>
                  <p className="text-dim-gray text-sm">
                    Our development follows secure coding practices with security built into the SDLC.
                    All code undergoes security review, static analysis, and dynamic security testing
                    before deployment to production.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-dim-gray text-sm pl-14">
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>OWASP Top 10 mitigation strategies</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Regular security-focused code reviews</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Continuous dependency vulnerability monitoring</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Vulnerability Disclosure Policy */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Vulnerability Disclosure Policy</h2>
          <div className="terminal-card p-6 rounded-lg">
            <p className="text-dim-gray mb-6">
              We believe in the power of the security community to help identify and address vulnerabilities.
              Our vulnerability disclosure policy is designed to provide security researchers with clear guidelines
              for conducting security testing and reporting vulnerabilities.
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="scope" className="border-b border-matrix/20">
                <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-4">Scope of Testing</AccordionTrigger>
                <AccordionContent className="text-dim-gray pb-4">
                  <p className="mb-3">
                    The following systems are in scope for security testing:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>*.cyberhunt.com</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>api.cyberhunt.com</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>CyberHunt mobile applications</span>
                    </li>
                  </ul>
                  <p className="mt-3">
                    The following are explicitly out of scope:
                  </p>
                  <ul className="space-y-2 pl-4 mt-2">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Physical attacks against CyberHunt offices or data centers</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Social engineering attacks against CyberHunt employees</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Denial of service attacks</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Third-party services used by CyberHunt</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="rules" className="border-b border-matrix/20">
                <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-4">Rules of Engagement</AccordionTrigger>
                <AccordionContent className="text-dim-gray pb-4">
                  <p className="mb-3">
                    When conducting security testing against CyberHunt systems, please adhere to the following rules:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not access, modify, or delete data that does not belong to you</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not conduct testing that could degrade or disrupt our services</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not share access to CyberHunt systems with other individuals</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not conduct automated scanning without prior approval</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Do not publicly disclose a vulnerability before we have had a chance to address it</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="reporting" className="border-b border-matrix/20">
                <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-4">Reporting a Vulnerability</AccordionTrigger>
                <AccordionContent className="text-dim-gray pb-4">
                  <p className="mb-3">
                    To report a vulnerability to CyberHunt, please submit your findings through our dedicated security reporting channel:
                  </p>
                  <div className="bg-terminal p-4 rounded-md mb-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-matrix mr-2" />
                      <a href="mailto:security@cyberhunt.com" className="text-matrix font-mono">security@cyberhunt.com</a>
                    </div>
                  </div>
                  <p className="mb-3">Please include the following information in your report:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>A detailed description of the vulnerability</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Steps to reproduce the issue</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Potential impact of the vulnerability</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Any supporting materials (screenshots, videos, etc.)</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="response" className="border-b border-matrix/20">
                <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-4">Our Response Process</AccordionTrigger>
                <AccordionContent className="text-dim-gray pb-4">
                  <p className="mb-3">When we receive a vulnerability report, you can expect the following response timeline:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Initial Response:</strong> We'll acknowledge receipt of your report within 24 hours</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Triage:</strong> We'll evaluate the report and determine its impact and validity within 3 business days</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Remediation:</strong> We'll work to address valid vulnerabilities, with timelines based on severity</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Verification:</strong> We'll validate that our fix addresses the reported issue</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Disclosure:</strong> We'll coordinate with you on public disclosure, if applicable</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="rewards" className="border-b-0">
                <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-4">Rewards & Recognition</AccordionTrigger>
                <AccordionContent className="text-dim-gray pb-4">
                  <p className="mb-3">
                    While we don't operate a formal bug bounty program for our platform, we do recognize and appreciate
                    the efforts of security researchers who help us improve our security:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Public acknowledgment on our security hall of fame (with your permission)</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Letter of appreciation that can be used as a reference</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Occasional rewards at our discretion for exceptional findings</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span>Reputation points and special badges on your CyberHunt profile</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Certifications & Compliance */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Certifications & Compliance</h2>
          <div className="terminal-card p-6 rounded-lg">
            <p className="text-dim-gray mb-6">
              CyberHunt is committed to maintaining the highest standards of security and privacy.
              We adhere to industry best practices and maintain several security certifications:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-4">
                    <ShieldCheck className="h-5 w-5 text-matrix" />
                  </div>
                  <h3 className="text-lg font-mono text-light-gray">SOC 2 Type II</h3>
                </div>
                <p className="text-dim-gray text-sm mb-4">
                  Our platform has successfully completed SOC 2 Type II audits, demonstrating our commitment
                  to security, availability, processing integrity, confidentiality, and privacy.
                </p>
                <div className="flex justify-end">
                  <Link href="/security/certifications">
                    <a className="text-matrix text-sm flex items-center">
                      Learn More <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
              
              <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-4">
                    <ShieldCheck className="h-5 w-5 text-electric-blue" />
                  </div>
                  <h3 className="text-lg font-mono text-light-gray">ISO 27001</h3>
                </div>
                <p className="text-dim-gray text-sm mb-4">
                  CyberHunt maintains ISO 27001 certification, the international standard for information
                  security management systems (ISMS).
                </p>
                <div className="flex justify-end">
                  <Link href="/security/certifications">
                    <a className="text-matrix text-sm flex items-center">
                      Learn More <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
              
              <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-4">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-mono text-light-gray">GDPR Compliance</h3>
                </div>
                <p className="text-dim-gray text-sm mb-4">
                  Our platform is fully compliant with the General Data Protection Regulation (GDPR),
                  providing robust privacy protections for users in the European Union.
                </p>
                <div className="flex justify-end">
                  <Link href="/privacy-policy">
                    <a className="text-matrix text-sm flex items-center">
                      Learn More <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
              
              <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-4">
                    <ShieldCheck className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-mono text-light-gray">CCPA Compliance</h3>
                </div>
                <p className="text-dim-gray text-sm mb-4">
                  CyberHunt complies with the California Consumer Privacy Act (CCPA), respecting the
                  privacy rights of California residents.
                </p>
                <div className="flex justify-end">
                  <Link href="/privacy-policy">
                    <a className="text-matrix text-sm flex items-center">
                      Learn More <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Contact */}
        <div className="terminal-card p-8 rounded-lg text-center">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-3">Contact Our Security Team</h2>
          <p className="text-dim-gray mb-6 max-w-2xl mx-auto">
            For security-related inquiries, vulnerability reports, or concerns, please contact our
            dedicated security team. We take all security matters seriously and appreciate your help
            in keeping CyberHunt secure.
          </p>
          <div className="flex justify-center mb-6">
            <a 
              href="mailto:security@cyberhunt.com" 
              className="inline-flex items-center px-6 py-3 bg-matrix text-black rounded-md font-mono hover:bg-matrix/80 transition duration-200"
            >
              <Mail className="mr-2 h-5 w-5" />
              security@cyberhunt.com
            </a>
          </div>
          <p className="text-xs text-dim-gray">
            For non-security issues, please contact <a href="mailto:support@cyberhunt.com" className="text-matrix">support@cyberhunt.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}