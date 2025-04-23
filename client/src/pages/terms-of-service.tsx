import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import MatrixBackground from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <Link href="/auth">
          <Button variant="outline" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Button>
        </Link>
        
        <div className="terminal-card p-8 rounded-lg mb-6">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-6">Terms of Service</h1>
          
          <div className="space-y-6 text-dim-gray">
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using CyberHunt (the "Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">2. Description of Service</h2>
              <p>
                CyberHunt is a cybersecurity bug bounty platform that enables security researchers to discover and 
                report vulnerabilities in participating programs. The platform facilitates responsible disclosure and 
                rewards researchers for their findings.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">3. Registration and Account Security</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to provide accurate,
                current, and complete information during the registration process and to update such information to keep it 
                accurate, current, and complete. You are responsible for safeguarding your password and for all activities 
                that occur under your account.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">4. Code of Conduct</h2>
              <p>
                As a security researcher on our platform, you agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Report vulnerabilities only to the affected program through our platform</li>
                <li>Respect the scope defined by each program</li>
                <li>Avoid any testing that could harm system availability or data integrity</li>
                <li>Never access, modify, or delete data that doesn't belong to your test account</li>
                <li>Never perform social engineering or phishing attacks on employees unless explicitly authorized</li>
                <li>Maintain confidentiality of findings until authorized for disclosure</li>
                <li>Provide clear documentation for reproducibility of reported issues</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">5. Rewards and Payments</h2>
              <p>
                Rewards for vulnerability reports are determined solely by the program owners based on their established 
                criteria for severity and impact. CyberHunt does not guarantee any specific reward amounts. All payments are 
                subject to verification of the vulnerability and compliance with program terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">6. Intellectual Property Rights</h2>
              <p>
                The Service and its original content, features, and functionality are owned by CyberHunt and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary 
                rights laws.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">7. Limitation of Liability</h2>
              <p>
                In no event shall CyberHunt, nor its directors, employees, partners, agents, suppliers, or affiliates, be 
                liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
                loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
                inability to access or use the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">8. Legal Compliance</h2>
              <p>
                You agree to comply with all applicable laws regarding your use of the Service, including laws regarding 
                computer security, data protection, and privacy. CyberHunt does not provide legal safe harbor for your 
                security research activities. You are solely responsible for complying with all applicable laws.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. It is your 
                responsibility to review these Terms periodically for changes. Your continued use of the Service following 
                the posting of any changes to these Terms constitutes acceptance of those changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">10. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or 
                liability, under our sole discretion, for any reason whatsoever and without limitation, including but not 
                limited to a breach of the Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at legal@cyberhunt.com.
              </p>
            </section>
            
            <div className="pt-4 border-t border-dark-terminal text-center">
              <p>Last updated: March 29, 2025</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}