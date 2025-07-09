
import { Link } from "wouter";
import { 
  ArrowRight, 
  Shield, 
  Users, 
  TrendingUp, 
  Lock, 
  CheckCircle, 
  Star, 
  Building2, 
  Zap, 
  Eye, 
  Clock, 
  Award, 
  Globe, 
  FileText, 
  ChevronRight, 
  Monitor, 
  Database, 
  Bot,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  Activity,
  BarChart3,
  DollarSign,
  Target,
  Lightbulb,
  Search,
  AlertTriangle,
  Download,
  BookOpen,
  Settings,
  HeadphonesIcon,
  Quote
} from "lucide-react";
import MatrixBackground from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ClientLandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "Advanced Security Testing",
      description: "Access to thousands of vetted ethical hackers worldwide who continuously test your applications for vulnerabilities."
    },
    {
      icon: Bot,
      title: "AI-Powered Triage",
      description: "Our intelligent triage system automatically validates, prioritizes, and categorizes vulnerabilities to reduce false positives."
    },
    {
      icon: Monitor,
      title: "Real-Time Dashboard",
      description: "Comprehensive dashboard with real-time analytics, vulnerability tracking, and detailed reporting capabilities."
    },
    {
      icon: Database,
      title: "Secure Data Management",
      description: "Enterprise-grade security with encrypted communications, secure file sharing, and comprehensive audit trails."
    },
    {
      icon: Users,
      title: "Expert Support Team",
      description: "Dedicated customer success team and security experts available 24/7 to assist with your program."
    },
    {
      icon: Activity,
      title: "Compliance Ready",
      description: "Built-in compliance features for SOC 2, ISO 27001, GDPR, and other regulatory requirements."
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "$499",
      period: "per month",
      description: "Perfect for startups and small companies",
      features: [
        "Up to 50 vulnerability submissions per month",
        "Basic triage and validation",
        "Email notifications",
        "Standard support",
        "Basic analytics dashboard",
        "Integration with popular tools"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$1,299",
      period: "per month",
      description: "Ideal for growing companies",
      features: [
        "Up to 200 vulnerability submissions per month",
        "Advanced AI-powered triage",
        "Real-time notifications",
        "Priority support",
        "Advanced analytics and reporting",
        "Custom integrations",
        "Dedicated account manager"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited vulnerability submissions",
        "White-label solution",
        "Advanced compliance features",
        "24/7 dedicated support",
        "Custom reporting and analytics",
        "API access and custom integrations",
        "On-premise deployment options"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      company: "TechCorp Inc.",
      logo: "🏢",
      testimonial: "Cyber Hunt has revolutionized our security testing process. We've identified and fixed over 150 critical vulnerabilities in just 6 months.",
      author: "Sarah Johnson",
      role: "Chief Security Officer",
      rating: 5
    },
    {
      company: "StartupXYZ",
      logo: "🚀",
      testimonial: "The platform's triage service saved us countless hours. Their security experts validated vulnerabilities quickly and provided actionable remediation steps.",
      author: "Michael Chen",
      role: "CTO",
      rating: 5
    },
    {
      company: "Global Finance Corp",
      logo: "🏦",
      testimonial: "Outstanding compliance support and detailed reporting. Cyber Hunt helped us achieve SOC 2 certification with comprehensive security documentation.",
      author: "Emily Rodriguez",
      role: "Compliance Director",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How do you ensure the quality of security researchers?",
      answer: "All researchers on our platform undergo rigorous vetting including background checks, skill assessments, and continuous performance monitoring. We maintain a community of verified ethical hackers with proven track records."
    },
    {
      question: "What types of vulnerabilities can be found through your platform?",
      answer: "Our researchers can identify a wide range of vulnerabilities including SQL injection, XSS, authentication bypasses, privilege escalation, API security issues, mobile app vulnerabilities, and more."
    },
    {
      question: "How quickly can we expect to see results?",
      answer: "Most programs start receiving vulnerability reports within 24-48 hours of launch. Our average response time for triage is 12-24 hours, with critical vulnerabilities prioritized immediately."
    },
    {
      question: "Is my data secure on your platform?",
      answer: "Yes, we employ enterprise-grade security measures including end-to-end encryption, SOC 2 compliance, regular security audits, and secure communication channels. Your data never leaves our secure infrastructure."
    },
    {
      question: "Can I integrate Cyber Hunt with my existing tools?",
      answer: "Yes, we offer integrations with popular tools like Jira, Slack, Microsoft Teams, GitHub, and many others. We also provide REST APIs for custom integrations."
    },
    {
      question: "What happens if a researcher finds a critical vulnerability?",
      answer: "Critical vulnerabilities are immediately escalated to our security team and your designated contacts. We provide detailed reports with reproduction steps and recommended fixes within hours."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Vulnerabilities Found" },
    { number: "2,500+", label: "Companies Protected" },
    { number: "15,000+", label: "Security Researchers" },
    { number: "99.9%", label: "Platform Uptime" }
  ];

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      
      {/* Navigation */}
      <nav className="relative z-20 bg-terminal/90 backdrop-blur-sm border-b border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="text-matrix text-xl font-mono font-bold cursor-pointer">
                CyberHunt_
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-matrix/30 text-matrix hover:bg-matrix/20">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="glow-button">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-mono font-bold text-light-gray mb-6">
              Secure Your Organization with
              <span className="text-matrix block mt-2">Crowdsourced Security</span>
            </h1>
            <p className="text-xl text-dim-gray mb-8 max-w-3xl mx-auto">
              Join thousands of companies using Cyber Hunt to discover vulnerabilities before attackers do. 
              Our platform connects you with elite security researchers worldwide, providing comprehensive 
              security testing and expert triage services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="glow-button text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-matrix/30 text-matrix hover:bg-matrix/20 text-lg px-8 py-6">
                <Phone className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 border-t border-matrix/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-mono font-bold text-matrix mb-2">
                  {stat.number}
                </div>
                <div className="text-dim-gray font-mono text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-light-gray mb-4">
              Why Choose <span className="text-matrix">Cyber Hunt</span>?
            </h2>
            <p className="text-xl text-dim-gray max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with human expertise to provide 
              comprehensive security testing and vulnerability management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-terminal/50 border-matrix/30 hover:border-matrix/60 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-3 bg-matrix/20 rounded-lg mr-4">
                      <feature.icon className="h-6 w-6 text-matrix" />
                    </div>
                    <CardTitle className="text-light-gray font-mono">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-dim-gray">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Triage Services Section */}
      <section className="relative z-10 py-20 bg-terminal/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-light-gray mb-4">
              <span className="text-matrix">Managed Triage Services</span>
            </h2>
            <p className="text-xl text-dim-gray max-w-3xl mx-auto">
              Let our security experts handle vulnerability validation and risk assessment, 
              so your team can focus on fixing critical issues.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-mono font-bold text-matrix mb-6">
                Expert Validation & Prioritization
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-mono font-semibold text-light-gray">Professional Triage</h4>
                    <p className="text-dim-gray">Expert security analysts validate every submission and provide detailed risk assessments.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-mono font-semibold text-light-gray">Rapid Response</h4>
                    <p className="text-dim-gray">Critical vulnerabilities are triaged within 4-8 hours, reducing your exposure time.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-matrix mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-mono font-semibold text-light-gray">Actionable Reports</h4>
                    <p className="text-dim-gray">Detailed remediation guidance with technical analysis and business impact assessment.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="bg-terminal/50 border-matrix/30">
              <CardHeader>
                <CardTitle className="text-matrix font-mono">Triage Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-matrix/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-matrix font-mono text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-mono text-light-gray">Submission Review</h4>
                      <p className="text-dim-gray text-sm">Initial assessment and validation</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-matrix/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-matrix font-mono text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-mono text-light-gray">Risk Analysis</h4>
                      <p className="text-dim-gray text-sm">Severity scoring and impact evaluation</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-matrix/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-matrix font-mono text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-mono text-light-gray">Detailed Report</h4>
                      <p className="text-dim-gray text-sm">Comprehensive findings and remediation steps</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-light-gray mb-4">
              <span className="text-matrix">Flexible Pricing</span> for Every Organization
            </h2>
            <p className="text-xl text-dim-gray max-w-3xl mx-auto">
              Choose the plan that fits your security needs and budget. All plans include our core platform features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-matrix bg-terminal/70' : 'bg-terminal/50 border-matrix/30'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-matrix text-deep-black px-3 py-1 text-sm font-mono font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-light-gray font-mono text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-mono font-bold text-matrix mt-2">
                    {plan.price}
                    <span className="text-dim-gray text-base ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription className="text-dim-gray">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-dim-gray text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'glow-button' : 'border-matrix/30 text-matrix hover:bg-matrix/20'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 bg-terminal/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-light-gray mb-4">
              What Our <span className="text-matrix">Clients Say</span>
            </h2>
            <p className="text-xl text-dim-gray max-w-3xl mx-auto">
              Join hundreds of satisfied companies who trust Cyber Hunt to secure their applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-terminal/50 border-matrix/30">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">{testimonial.logo}</div>
                    <div>
                      <h4 className="font-mono font-semibold text-light-gray">{testimonial.company}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-matrix fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Quote className="h-8 w-8 text-matrix/40 mb-4" />
                  <p className="text-dim-gray mb-4 italic">"{testimonial.testimonial}"</p>
                  <div className="border-t border-matrix/20 pt-4">
                    <p className="font-mono text-light-gray text-sm">{testimonial.author}</p>
                    <p className="text-dim-gray text-xs">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-light-gray mb-4">
              Frequently Asked <span className="text-matrix">Questions</span>
            </h2>
            <p className="text-xl text-dim-gray">
              Everything you need to know about our platform and services.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-matrix/30">
                <AccordionTrigger className="text-light-gray font-mono hover:text-matrix">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-dim-gray">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-terminal/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-mono font-bold text-light-gray mb-4">
            Ready to <span className="text-matrix">Secure Your Organization</span>?
          </h2>
          <p className="text-xl text-dim-gray mb-8">
            Join thousands of companies using Cyber Hunt to discover and fix vulnerabilities before attackers do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="glow-button text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-matrix/30 text-matrix hover:bg-matrix/20 text-lg px-8 py-6">
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Sales
            </Button>
          </div>
          <p className="text-dim-gray text-sm mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-terminal border-t border-matrix/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-matrix text-xl font-mono font-bold mb-4">CyberHunt_</div>
              <p className="text-dim-gray text-sm">
                The world's leading bug bounty platform, connecting organizations with elite security researchers.
              </p>
            </div>
            <div>
              <h4 className="font-mono font-semibold text-light-gray mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/features" className="block text-dim-gray hover:text-matrix text-sm">Features</Link>
                <Link href="/pricing" className="block text-dim-gray hover:text-matrix text-sm">Pricing</Link>
                <Link href="/integrations" className="block text-dim-gray hover:text-matrix text-sm">Integrations</Link>
              </div>
            </div>
            <div>
              <h4 className="font-mono font-semibold text-light-gray mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="/documentation" className="block text-dim-gray hover:text-matrix text-sm">Documentation</Link>
                <Link href="/blog" className="block text-dim-gray hover:text-matrix text-sm">Blog</Link>
                <Link href="/help-center" className="block text-dim-gray hover:text-matrix text-sm">Help Center</Link>
              </div>
            </div>
            <div>
              <h4 className="font-mono font-semibold text-light-gray mb-4">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center text-dim-gray text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  sales@cyberhunt.com
                </div>
                <div className="flex items-center text-dim-gray text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (555) 123-4567
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-matrix/30 mt-8 pt-8 text-center">
            <p className="text-dim-gray text-sm">
              © 2024 CyberHunt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
