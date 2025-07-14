import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-mono font-bold text-matrix mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-dim-gray">
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">1. Introduction</h2>
              <p>
                This Privacy Policy explains how CyberHunt ("we", "us", or "our") collects, uses, and shares your personal 
                information when you use our cybersecurity bug bounty platform (the "Service"). By using the Service, you 
                consent to the collection, use, and sharing of your personal information as described in this Privacy Policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">2. Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our Service, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <span className="text-light-gray">Personal Information:</span> This includes your name, email address, username, 
                  and other information you provide during registration or when updating your profile.
                </li>
                <li>
                  <span className="text-light-gray">Usage Data:</span> We collect information about how you interact with our 
                  Service, including the pages you visit, the time and date of your visits, and the time spent on those pages.
                </li>
                <li>
                  <span className="text-light-gray">Technical Data:</span> This includes your IP address, browser type and version, 
                  operating system, and device information.
                </li>
                <li>
                  <span className="text-light-gray">Program and Submission Data:</span> Information related to your bug bounty 
                  submissions, including vulnerability details, impact assessments, and communication with program owners.
                </li>
                <li>
                  <span className="text-light-gray">Payment Information:</span> For processing rewards, we collect payment-related 
                  information. Full payment details are processed by our secure payment processors and are not stored on our servers.
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">3. How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Providing, maintaining, and improving our Service</li>
                <li>Processing and managing vulnerability submissions</li>
                <li>Facilitating communication between security researchers and program owners</li>
                <li>Processing payments and rewards</li>
                <li>Sending notifications about your account, submissions, or programs you follow</li>
                <li>Analyzing usage patterns to enhance user experience</li>
                <li>Ensuring compliance with our Terms of Service and applicable laws</li>
                <li>Preventing fraudulent or unauthorized activity</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">4. Information Sharing and Disclosure</h2>
              <p>
                We may share your personal information in the following situations:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <span className="text-light-gray">With Program Owners:</span> When you submit a vulnerability report, the 
                  information in that report, along with your profile information, is shared with the relevant program owner.
                </li>
                <li>
                  <span className="text-light-gray">Service Providers:</span> We may share your information with third-party vendors, 
                  service providers, or contractors who perform services on our behalf.
                </li>
                <li>
                  <span className="text-light-gray">Legal Requirements:</span> We may disclose your information if required to do so 
                  by law or in response to valid requests by public authorities.
                </li>
                <li>
                  <span className="text-light-gray">Business Transfers:</span> In connection with any merger, sale of company assets, 
                  financing, or acquisition of all or a portion of our business to another company.
                </li>
                <li>
                  <span className="text-light-gray">With Your Consent:</span> We may share your information for any other purpose 
                  disclosed to you with your consent.
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. 
                However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% 
                secure, and we cannot guarantee its absolute security.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">6. Your Data Protection Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to restrict or object to processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, please contact us using the contact information provided below.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">7. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from 
                children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal 
                information, please contact us so that we can take necessary actions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
                Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically 
                for any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-mono text-light-gray mb-3">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@cyberhunt.com.
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