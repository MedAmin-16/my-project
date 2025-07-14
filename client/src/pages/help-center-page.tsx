import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  Search,
  HelpCircle,
  Book,
  FileText,
  AlertTriangle,
  Lock,
  ShieldCheck,
  CreditCard,
  Award,
  MessageCircle,
  User,
  Mail,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // FAQ categories and items
  const faqCategories = [
    {
      id: "general",
      name: "General Questions",
      icon: <HelpCircle className="h-5 w-5 text-matrix" />,
      faqs: [
        {
          question: "What is CyberHunt?",
          answer: "CyberHunt is a bug bounty platform that connects security researchers with organizations looking to improve their security posture. Our platform gamifies the bug hunting process, offering rewards, reputation points, and achievements for finding and reporting security vulnerabilities."
        },
        {
          question: "How does CyberHunt differ from other bug bounty platforms?",
          answer: "CyberHunt stands out with its gamified approach to bug bounties. We incorporate elements like achievements, leaderboards, and reputation levels to make vulnerability hunting more engaging and rewarding. Our platform also emphasizes learning and skill development through resources, tutorials, and mentorship opportunities."
        },
        {
          question: "Is CyberHunt free to use?",
          answer: "CyberHunt is free for security researchers to join and participate in public programs. Organizations running bug bounty programs pay for our services, which include program management, triage, and platform features."
        },
        {
          question: "Can I participate if I'm new to security research?",
          answer: "Absolutely! We welcome researchers of all experience levels. We offer resources, guides, and introductory programs specifically designed for newcomers to the field. Our reputation system also helps match you with programs appropriate for your skill level."
        }
      ]
    },
    {
      id: "researchers",
      name: "For Security Researchers",
      icon: <ShieldCheck className="h-5 w-5 text-electric-blue" />,
      faqs: [
        {
          question: "How do I get started as a researcher?",
          answer: "To get started, create an account, complete your profile, verify your email, and explore available programs. We recommend beginning with our resources section to familiarize yourself with common vulnerability types and best practices before submitting your first report."
        },
        {
          question: "How does the reputation system work?",
          answer: "Your reputation score increases when your vulnerability reports are accepted and validated. Higher-severity findings award more reputation points. As your reputation grows, you unlock access to invitation-only programs and additional platform features. Your position on the leaderboard is determined by your reputation score."
        },
        {
          question: "How and when do I get paid for my findings?",
          answer: "Payment terms vary by program, but typically bounties are paid after a vulnerability is validated and fixed. Payments are processed through our platform, and you can receive funds via bank transfer, PayPal, or cryptocurrency, depending on your preferences and regional availability."
        },
        {
          question: "What if my report is rejected?",
          answer: "If your report is rejected, you'll receive feedback explaining why. Common reasons include duplicate reports, out-of-scope vulnerabilities, or insufficient information. You can use this feedback to improve future submissions. If you believe a rejection was in error, you can request a review."
        }
      ]
    },
    {
      id: "programs",
      name: "For Program Owners",
      icon: <Lock className="h-5 w-5 text-green-500" />,
      faqs: [
        {
          question: "How do I start a bug bounty program?",
          answer: "To launch a program, contact our sales team or create an organization account and follow the program setup process. You'll define the scope, rules, reward structure, and other parameters. Our team can assist with best practices and program optimization to ensure you get the most value."
        },
        {
          question: "What does a typical bug bounty program cost?",
          answer: "Program costs vary based on several factors, including the scope, duration, and level of support required. In addition to platform fees, you'll need to budget for bounty payments. We offer flexible pricing models, including pay-per-vulnerability and subscription-based options."
        },
        {
          question: "How do you ensure quality reports?",
          answer: "Our platform includes a built-in triage process that validates reports before they reach you. Our reputation system also helps filter out low-quality submissions by incentivizing thorough, well-documented reports. Additionally, we offer managed triage services where our experts handle initial validation."
        },
        {
          question: "Can we run a private or invitation-only program?",
          answer: "Yes, you can create private programs visible only to selected researchers or those who meet specific reputation criteria. Private programs give you more control over who can test your systems and allow for a more targeted approach to vulnerability discovery."
        }
      ]
    },
    {
      id: "technical",
      name: "Technical Questions",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      faqs: [
        {
          question: "What types of vulnerabilities are typically in scope?",
          answer: "Common in-scope vulnerabilities include SQLi, XSS, CSRF, SSRF, authentication flaws, authorization issues, business logic flaws, and other OWASP Top 10 vulnerabilities. Each program defines its specific scope, which may include or exclude certain vulnerability types."
        },
        {
          question: "How should I format my vulnerability reports?",
          answer: "A good report includes a clear title, detailed description, steps to reproduce, impact assessment, and suggested remediation. Our platform provides a standard template to help structure your reports effectively. Including screenshots or videos demonstrating the vulnerability is highly recommended."
        },
        {
          question: "Do you support API or mobile application testing?",
          answer: "Yes, many programs include APIs and mobile applications within their scope. Our platform supports report formats specific to these technologies, and we provide specialized resources for testing APIs, Android apps, and iOS applications."
        },
        {
          question: "What tools can I use for testing?",
          answer: "You can use standard security testing tools, but always respect the program's rules regarding automated testing. Some programs limit the use of scanners or require prior approval. Our resources section lists recommended tools for various testing scenarios and vulnerability types."
        }
      ]
    },
    {
      id: "payment",
      name: "Payment & Rewards",
      icon: <CreditCard className="h-5 w-5 text-purple-400" />,
      faqs: [
        {
          question: "What payment methods are supported?",
          answer: "We support payments via bank transfer, PayPal, and several cryptocurrencies including Bitcoin and Ethereum. Available payment methods may vary by region. You can manage your payment preferences in your account settings."
        },
        {
          question: "How are bounty amounts determined?",
          answer: "Bounty amounts are determined by the program owner based on the severity and impact of the vulnerability. Most programs publish a reward range for different vulnerability types and severity levels. The final amount is at the discretion of the program owner, with guidance from our triage team."
        },
        {
          question: "Are there taxes on bounty payments?",
          answer: "Bounty payments may be subject to taxes depending on your country of residence. We provide basic tax documentation, but we advise consulting with a tax professional regarding your specific situation. You are responsible for reporting and paying any applicable taxes on your earnings."
        },
        {
          question: "What if there's a dispute about a bounty amount?",
          answer: "If you believe a bounty doesn't reflect the severity of your finding, you can request a review. Our mediation team will assess the vulnerability and work with both parties to reach a fair resolution. We strive to ensure researchers are appropriately compensated for their valuable contributions."
        }
      ]
    }
  ];
  
  // Help categories
  const helpCategories = [
    {
      title: "Getting Started",
      icon: <Book className="h-6 w-6 text-matrix" />,
      description: "New to CyberHunt? Learn the basics and set up your account",
      links: [
        "Account Setup Guide",
        "Researcher Onboarding",
        "Program Owner Quickstart",
        "Platform Navigation Tutorial"
      ]
    },
    {
      title: "Submitting Reports",
      icon: <FileText className="h-6 w-6 text-electric-blue" />,
      description: "Learn how to create effective vulnerability reports",
      links: [
        "Report Writing Best Practices",
        "Severity Classification Guide",
        "Report Template Guide",
        "Common Report Mistakes"
      ]
    },
    {
      title: "Payment & Rewards",
      icon: <CreditCard className="h-6 w-6 text-green-500" />,
      description: "Everything about bounties, payments, and taxes",
      links: [
        "Payment Methods Overview",
        "Tax Information Guide",
        "Understanding Bounty Ranges",
        "Payment Troubleshooting"
      ]
    },
    {
      title: "Program Management",
      icon: <Lock className="h-6 w-6 text-yellow-400" />,
      description: "Resources for running successful bug bounty programs",
      links: [
        "Program Setup Guide",
        "Scope Definition Best Practices",
        "Reward Structure Guidelines",
        "Triage Process Explained"
      ]
    },
    {
      title: "Reputation System",
      icon: <Award className="h-6 w-6 text-purple-400" />,
      description: "Understanding how reputation and rankings work",
      links: [
        "Reputation Points Explained",
        "Leaderboard Ranking Guide",
        "Achievements & Badges",
        "Unlocking Opportunities"
      ]
    },
    {
      title: "Community & Support",
      icon: <MessageCircle className="h-6 w-6 text-red-400" />,
      description: "Connect with other researchers and get help",
      links: [
        "Community Guidelines",
        "Discord Server Information",
        "Mentorship Program",
        "Events Calendar"
      ]
    }
  ];
  
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="terminal-card p-8 rounded-lg mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-matrix mb-4">CyberHunt Help Center</h1>
          <p className="text-dim-gray mb-6 max-w-3xl mx-auto">
            Find answers to frequently asked questions, tutorials, and resources to help you 
            make the most of CyberHunt's bug bounty platform.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search for help..."
              className="bg-dark-terminal border-matrix/30 pl-10 h-12 font-mono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-dim-gray pointer-events-none" />
          </div>
        </div>
        
        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Help Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <div key={index} className="terminal-card p-5 rounded-lg border border-matrix/30 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-start mb-3">
                  <div className="h-12 w-12 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-4">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-mono text-light-gray">{category.title}</h3>
                    <p className="text-dim-gray text-sm mb-3">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {category.links.map((link, i) => (
                    <li key={i} className="text-sm">
                      <a href="#" className="flex items-center text-matrix hover:text-matrix-light">
                        <ChevronRight className="h-3 w-3 mr-1" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Frequently Asked Questions</h2>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-transparent h-auto p-0 mb-6">
              {faqCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center justify-center text-xs md:text-sm bg-terminal border border-matrix/30 data-[state=active]:bg-matrix/10 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray rounded-md py-2 px-3"
                >
                  {category.icon}
                  <span className="ml-2 hidden md:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {faqCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="p-0 mt-0">
                <div className="terminal-card p-5 rounded-lg">
                  <h3 className="text-xl font-mono text-matrix mb-4">{category.name} FAQ</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border-b border-matrix/20 last:border-0">
                        <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-4 text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-dim-gray text-sm py-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        {/* Contact Section */}
        <div className="terminal-card p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Still Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-matrix" />
                </div>
                <h3 className="text-lg font-mono text-light-gray">Customer Support</h3>
              </div>
              <p className="text-dim-gray text-sm mb-3">
                Our support team is available to assist with technical issues, account questions, and general inquiries.
              </p>
              <a href="#" className="text-matrix hover:text-matrix-light text-sm font-mono">Open Support Ticket</a>
            </div>
            
            <div className="p-5 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                  <Mail className="h-5 w-5 text-electric-blue" />
                </div>
                <h3 className="text-lg font-mono text-light-gray">Email Us</h3>
              </div>
              <p className="text-dim-gray text-sm mb-3">
                For detailed inquiries or specific questions, reach out to our team via email for a personalized response.
              </p>
              <a href="mailto:support@cyberhunt.com" className="text-matrix hover:text-matrix-light text-sm font-mono">support@cyberhunt.com</a>
            </div>
            
            <div className="p-5 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-mono text-light-gray">Community Forums</h3>
              </div>
              <p className="text-dim-gray text-sm mb-3">
                Join our community forums to connect with other users, share knowledge, and find solutions to common issues.
              </p>
              <a href="#" className="text-matrix hover:text-matrix-light text-sm font-mono">Visit Forums</a>
            </div>
          </div>
        </div>
        
        {/* Self-Service Tools */}
        <div className="terminal-card p-6 rounded-lg">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-4">Self-Service Tools</h2>
          <p className="text-dim-gray mb-6">
            Use these tools to troubleshoot common issues and manage your account:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="#" className="flex items-center p-3 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="h-8 w-8 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-matrix" />
              </div>
              <span className="text-sm font-mono text-light-gray">Account Recovery</span>
            </a>
            <a href="#" className="flex items-center p-3 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="h-8 w-8 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                <Lock className="h-4 w-4 text-electric-blue" />
              </div>
              <span className="text-sm font-mono text-light-gray">Reset Password</span>
            </a>
            <a href="#" className="flex items-center p-3 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="h-8 w-8 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                <CreditCard className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm font-mono text-light-gray">Payment Status</span>
            </a>
            <a href="#" className="flex items-center p-3 border border-matrix/30 rounded-lg hover:bg-matrix/5 transition duration-200">
              <div className="h-8 w-8 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-sm font-mono text-light-gray">API Documentation</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}