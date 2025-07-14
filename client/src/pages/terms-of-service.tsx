
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
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
              <h2 className="text-xl font-mono text-light-gray mb-3">1. Introduction and Acceptance of Terms</h2>
              <p>
                Welcome to CyberHunt, a cybersecurity bug bounty platform operated by CyberHunt Ltd. ("CyberHunt", "we", "us", or "our"). 
                By accessing or using the CyberHunt platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access or use the Service.
              </p>
              <p className="mt-2">
                These Terms constitute a legally binding agreement between you and CyberHunt. Your use of the Service confirms your 
                acceptance of these Terms and our Privacy Policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">2. Platform Overview and Services</h2>
              <p>
                CyberHunt is a cybersecurity bug bounty platform that facilitates responsible vulnerability disclosure between 
                security researchers ("Researchers") and participating organizations ("Companies"). The platform serves as a 
                neutral third-party intermediary to ensure fair compensation, professional communication, and secure handling 
                of vulnerability reports.
              </p>
              <p className="mt-2">
                Our services include vulnerability report management, payment processing, dispute resolution, and maintaining 
                professional standards for both Researchers and Companies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">3. Company Responsibilities and Obligations</h2>
              <p className="mb-3">
                Companies participating in CyberHunt bug bounty programs agree to the following obligations:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">3.1 Fair Compensation Commitment</h4>
                  <p>
                    Companies must commit to providing fair and reasonable bounty rewards for all valid vulnerability reports. 
                    Compensation must be commensurate with the severity, impact, and exploitability of the reported vulnerability 
                    as defined in the program's published reward structure.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">3.2 Response Timeline Requirements</h4>
                  <p>
                    Upon receiving a valid vulnerability report, Companies must provide an initial response within thirty (30) 
                    calendar days. This response must include acknowledgment of receipt, initial assessment, and expected timeline 
                    for final determination. Final resolution and payment must be completed within ninety (90) calendar days 
                    unless extraordinary circumstances warrant extension.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">3.3 Prohibition Against Silent Fixes</h4>
                  <p>
                    Companies are strictly prohibited from implementing fixes for reported vulnerabilities without proper 
                    acknowledgment and fair compensation to the reporting Researcher. Any attempt to silently address 
                    vulnerabilities without engaging the reporting process constitutes a material breach of these Terms.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">3.4 Payment Security Requirements</h4>
                  <p>
                    Companies may be required to maintain escrow funds or provide upfront payment guarantees to ensure 
                    researchers receive timely compensation. CyberHunt reserves the right to request advance funding for 
                    high-value programs or new Company accounts.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">4. Security Researcher Responsibilities and Code of Conduct</h2>
              <p className="mb-3">
                Security Researchers using CyberHunt agree to maintain the highest professional and ethical standards:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">4.1 Responsible Disclosure</h4>
                  <p>
                    Researchers must report vulnerabilities exclusively through the CyberHunt platform and only to authorized 
                    programs. All testing must remain within the defined scope and rules established by each program. 
                    Researchers must not exploit vulnerabilities for personal gain or malicious purposes.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">4.2 Quality and Detail Requirements</h4>
                  <p>
                    All vulnerability reports must include sufficient technical detail to allow reproduction and verification. 
                    Reports must be accurate, complete, and include proof-of-concept demonstrations where appropriate. 
                    Researchers are responsible for ensuring the quality and validity of their submissions.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">4.3 Confidentiality and Non-Disclosure</h4>
                  <p>
                    Researchers agree to maintain strict confidentiality regarding all vulnerability information and Company 
                    data encountered during testing. Information may not be shared, published, or disclosed outside the 
                    CyberHunt platform without explicit written authorization from the affected Company.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">4.4 Testing Limitations</h4>
                  <p>
                    Researchers must avoid any testing that could harm system availability, data integrity, or user privacy. 
                    Social engineering, physical attacks, and denial of service testing are prohibited unless explicitly 
                    authorized. Researchers must use only test accounts and avoid accessing production data.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">5. CyberHunt Platform Rules and Authority</h2>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">5.1 Neutral Third-Party Role</h4>
                  <p>
                    CyberHunt serves as a neutral intermediary between Companies and Researchers. We facilitate communication, 
                    manage payments, and ensure compliance with platform standards. Our role includes verification of 
                    vulnerability reports and mediation of disputes when necessary.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">5.2 Fund Management Authority</h4>
                  <p>
                    CyberHunt reserves the right to withhold, freeze, or escrow funds in case of disputes, suspected fraud, 
                    or violations of these Terms. Funds will be released only upon resolution of any outstanding issues and 
                    verification of compliance with platform requirements.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">5.3 Platform Commission</h4>
                  <p>
                    CyberHunt charges a service commission of fifteen to twenty percent (15-20%) on all paid bounties. 
                    This commission covers platform maintenance, payment processing, dispute resolution, and administrative 
                    services. The exact commission rate may vary based on program volume and service level.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">5.4 Public Disclosure Authority</h4>
                  <p>
                    In cases where Companies refuse to provide fair compensation without proper justification, CyberHunt 
                    reserves the right to authorize public disclosure of vulnerability information after appropriate review 
                    and consideration of all factors including public safety and responsible disclosure principles.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">6. Payment Processing and Financial Terms</h2>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">6.1 Payment Flow</h4>
                  <p>
                    All bounty payments must be processed through the CyberHunt platform. Companies deposit funds to the 
                    platform, CyberHunt deducts applicable commissions and fees, and releases payment to Researchers upon 
                    Company approval and platform verification.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">6.2 Escrow and Security</h4>
                  <p>
                    CyberHunt may require Companies to maintain escrow accounts or provide advance funding to guarantee payment 
                    availability. This requirement applies particularly to new accounts, high-value programs, or accounts with 
                    previous payment disputes.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">6.3 Payment Timeline</h4>
                  <p>
                    Upon Company approval of a bounty payment, CyberHunt will process payment to the Researcher within seven (7) 
                    business days, subject to standard banking and payment processor timelines.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">7. Dispute Resolution and Enforcement</h2>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">7.1 Final Authority</h4>
                  <p>
                    CyberHunt maintains final decision-making authority in all disputes between Companies and Researchers. 
                    Our decisions are based on technical merit, platform policies, industry standards, and fair dealing principles. 
                    All parties agree to accept CyberHunt's determinations as final and binding.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">7.2 Account Termination</h4>
                  <p>
                    Repeated violations of these Terms, abusive behavior, or attempts to circumvent platform processes will 
                    result in account suspension or permanent ban. CyberHunt reserves the right to terminate accounts immediately 
                    for serious violations including fraud, malicious activity, or legal compliance issues.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">7.3 Appeals Process</h4>
                  <p>
                    Users may appeal CyberHunt decisions through our formal appeals process within thirty (30) days of the 
                    original decision. Appeals must include new evidence or demonstrate procedural errors in the original determination.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">8. Legal Framework and Jurisdiction</h2>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">8.1 Governing Law</h4>
                  <p>
                    These Terms are governed by the laws of Tunisia and applicable international commercial law principles. 
                    For international disputes, the platform operates under established freelance and digital services frameworks 
                    recognized in international commerce.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">8.2 Limitation of Liability</h4>
                  <p>
                    CyberHunt serves as a mediator and platform provider. We are not liable for direct damages, losses, or 
                    disputes between Companies and Researchers beyond our role as facilitator. Our maximum liability is limited 
                    to the commission fees collected for the specific transaction in dispute.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-mono text-matrix mb-2">8.3 Legal Compliance</h4>
                  <p>
                    All platform users must comply with applicable laws in their jurisdiction regarding cybersecurity research, 
                    data protection, and computer security. Users are solely responsible for ensuring their activities comply 
                    with local legal requirements.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">9. Intellectual Property and Data Rights</h2>
              <p>
                Vulnerability information and research methodologies remain the intellectual property of the discovering Researcher, 
                subject to confidentiality obligations. Companies retain ownership of their systems and data. CyberHunt claims no 
                ownership over user content but requires necessary licenses to operate the platform and facilitate services.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">10. Platform Modifications and Updates</h2>
              <p>
                CyberHunt reserves the right to modify these Terms, platform features, and service offerings with appropriate 
                notice to users. Material changes will be communicated at least thirty (30) days in advance. Continued use 
                of the platform after changes constitutes acceptance of updated Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">11. Account Registration and Verification</h2>
              <p>
                Users must provide accurate, current, and complete information during registration. CyberHunt may require 
                identity verification, particularly for payment processing and high-value transactions. False information 
                or impersonation will result in immediate account termination.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">12. Contact Information and Support</h2>
              <p>
                For questions regarding these Terms, disputes, or platform support, users may contact CyberHunt through our 
                official support channels. Legal notices must be sent to legal@cyberhunt.com. Emergency security issues 
                should be reported to security@cyberhunt.com.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">13. Severability and Entire Agreement</h2>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full 
                force and effect. These Terms, together with our Privacy Policy, constitute the entire agreement between users 
                and CyberHunt regarding the platform services.
              </p>
            </section>
            
            <div className="pt-6 border-t border-dark-terminal">
              <div className="bg-matrix/10 border border-matrix/30 rounded-lg p-4">
                <h3 className="text-lg font-mono text-matrix mb-2">Important Notice</h3>
                <p className="text-sm text-dim-gray">
                  These Terms of Service constitute a legally binding contract. By using CyberHunt, you acknowledge that you 
                  have read, understood, and agree to be bound by these terms. If you are representing a company or organization, 
                  you warrant that you have the authority to bind that entity to these Terms.
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-dark-terminal text-center mt-6">
              <p className="text-matrix font-mono">Last updated: January 15, 2025</p>
              <p className="text-sm text-dim-gray mt-1">Version 2.0 - CyberHunt Bug Bounty Platform</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
