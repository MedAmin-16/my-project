import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  FileText,
  BookOpen,
  ExternalLink,
  Globe,
  Youtube,
  Code,
  Search,
  AlertTriangle,
  ShieldCheck,
  Terminal,
  GraduationCap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Hacker Resources</h1>
          <p className="text-dim-gray">
            Resources, tools, and learning materials to help you become a more effective security researcher.
          </p>
        </div>
        
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="w-full border-b border-dark-terminal mb-6 bg-transparent h-auto p-0 justify-start">
            <TabsTrigger 
              value="guides" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              Guides
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              Tools
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              Learning
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray"
            >
              Community
            </TabsTrigger>
          </TabsList>
          
          {/* Guides Tab */}
          <TabsContent value="guides" className="p-0 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Web Vulnerability Guide",
                  icon: <Globe className="h-5 w-5 text-electric-blue" />,
                  description: "Comprehensive guide to common web vulnerabilities including XSS, CSRF, SQL Injection, and more.",
                  link: "#"
                },
                {
                  title: "API Security Checklist",
                  icon: <Code className="h-5 w-5 text-green-500" />,
                  description: "Best practices for securing RESTful and GraphQL APIs, with examples of common vulnerabilities.",
                  link: "#"
                },
                {
                  title: "Mobile Security Testing",
                  icon: <Terminal className="h-5 w-5 text-purple-400" />,
                  description: "Guide to testing Android and iOS applications for security vulnerabilities.",
                  link: "#"
                },
                {
                  title: "Infrastructure Security",
                  icon: <ShieldCheck className="h-5 w-5 text-yellow-400" />,
                  description: "How to identify and report vulnerabilities in cloud infrastructure, servers, and networks.",
                  link: "#"
                },
                {
                  title: "Effective Bug Reports",
                  icon: <FileText className="h-5 w-5 text-matrix" />,
                  description: "How to write clear, comprehensive bug reports that maximize your chances of acceptance and rewards.",
                  link: "#"
                },
                {
                  title: "Recon Techniques",
                  icon: <Search className="h-5 w-5 text-red-400" />,
                  description: "Advanced reconnaissance methods for discovering assets, subdomains, and attack surface mapping.",
                  link: "#"
                }
              ].map((guide, index) => (
                <div key={index} className="terminal-card p-5 rounded-lg hover:bg-surface/50 transition-all duration-200 border border-matrix/30">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray mb-1 flex items-center">
                        {guide.title}
                        <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                      </h3>
                      <p className="text-sm text-dim-gray">{guide.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Tools Tab */}
          <TabsContent value="tools" className="p-0 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Burp Suite",
                  icon: <Terminal className="h-5 w-5 text-red-500" />,
                  description: "The leading web vulnerability scanner and proxy for security testing.",
                  link: "https://portswigger.net/burp"
                },
                {
                  title: "OWASP ZAP",
                  icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
                  description: "Free and open-source web app scanner, great for automated testing.",
                  link: "https://www.zaproxy.org/"
                },
                {
                  title: "Metasploit",
                  icon: <ShieldCheck className="h-5 w-5 text-blue-500" />,
                  description: "Penetration testing framework for discovering and exploiting vulnerabilities.",
                  link: "https://www.metasploit.com/"
                },
                {
                  title: "Amass",
                  icon: <Search className="h-5 w-5 text-green-500" />,
                  description: "Network mapping of attack surfaces and external asset discovery.",
                  link: "https://github.com/OWASP/Amass"
                },
                {
                  title: "Nuclei",
                  icon: <Code className="h-5 w-5 text-yellow-400" />,
                  description: "Fast and customizable vulnerability scanner based on templates.",
                  link: "https://github.com/projectdiscovery/nuclei"
                },
                {
                  title: "MobSF",
                  icon: <Terminal className="h-5 w-5 text-purple-400" />,
                  description: "Mobile Security Framework for automated mobile app security assessment.",
                  link: "https://github.com/MobSF/Mobile-Security-Framework-MobSF"
                }
              ].map((tool, index) => (
                <div key={index} className="terminal-card p-5 rounded-lg hover:bg-surface/50 transition-all duration-200 border border-matrix/30">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray mb-1 flex items-center">
                        {tool.title}
                        <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                      </h3>
                      <p className="text-sm text-dim-gray">{tool.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Learning Tab */}
          <TabsContent value="learning" className="p-0 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "OWASP Top 10",
                  icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                  description: "Learn about the most critical web application security risks.",
                  link: "https://owasp.org/www-project-top-ten/"
                },
                {
                  title: "PortSwigger Academy",
                  icon: <GraduationCap className="h-5 w-5 text-blue-500" />,
                  description: "Free, hands-on web security training with interactive labs.",
                  link: "https://portswigger.net/web-security"
                },
                {
                  title: "HackerOne CTF",
                  icon: <Terminal className="h-5 w-5 text-matrix" />,
                  description: "Capture the Flag challenges designed to teach hacking skills.",
                  link: "https://ctf.hacker101.com/"
                },
                {
                  title: "TryHackMe",
                  icon: <Code className="h-5 w-5 text-orange-500" />,
                  description: "Learn cybersecurity through hands-on exercises and challenges.",
                  link: "https://tryhackme.com/"
                },
                {
                  title: "Web Security Academy",
                  icon: <BookOpen className="h-5 w-5 text-green-500" />,
                  description: "Free online training for web application security techniques.",
                  link: "https://portswigger.net/web-security"
                },
                {
                  title: "Cybersecurity Courses",
                  icon: <Youtube className="h-5 w-5 text-red-600" />,
                  description: "Video tutorials and courses covering various security topics.",
                  link: "#"
                }
              ].map((resource, index) => (
                <div key={index} className="terminal-card p-5 rounded-lg hover:bg-surface/50 transition-all duration-200 border border-matrix/30">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      {resource.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray mb-1 flex items-center">
                        {resource.title}
                        <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                      </h3>
                      <p className="text-sm text-dim-gray">{resource.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Community Tab */}
          <TabsContent value="community" className="p-0 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "CyberHunt Forums",
                  icon: <Globe className="h-5 w-5 text-matrix" />,
                  description: "Join our community forums to discuss vulnerabilities, share tips, and get help.",
                  link: "#"
                },
                {
                  title: "Discord Community",
                  icon: <Terminal className="h-5 w-5 text-blue-400" />,
                  description: "Chat in real-time with other security researchers and CyberHunt team members.",
                  link: "#"
                },
                {
                  title: "Bug Bounty Meetups",
                  icon: <Globe className="h-5 w-5 text-green-500" />,
                  description: "Find local and virtual meetups for bug bounty hunters in your area.",
                  link: "#"
                },
                {
                  title: "CyberHunt Blog",
                  icon: <FileText className="h-5 w-5 text-purple-400" />,
                  description: "Articles, tutorials, and case studies from the CyberHunt team and guest authors.",
                  link: "#"
                },
                {
                  title: "Twitter Community",
                  icon: <Search className="h-5 w-5 text-blue-500" />,
                  description: "Follow us for updates, tips, and connections with other security researchers.",
                  link: "#"
                },
                {
                  title: "Mentorship Program",
                  icon: <GraduationCap className="h-5 w-5 text-yellow-400" />,
                  description: "Connect with experienced security researchers for guidance and mentorship.",
                  link: "#"
                }
              ].map((community, index) => (
                <div key={index} className="terminal-card p-5 rounded-lg hover:bg-surface/50 transition-all duration-200 border border-matrix/30">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      {community.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-mono text-light-gray mb-1 flex items-center">
                        {community.title}
                        <ExternalLink className="ml-2 h-3.5 w-3.5 text-dim-gray" />
                      </h3>
                      <p className="text-sm text-dim-gray">{community.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}