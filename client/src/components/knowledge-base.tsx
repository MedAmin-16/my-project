import { useState } from "react";
import { Search, Book, Shield, Terminal, AlertTriangle, Code, Database, Globe, Lock, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type KnowledgeCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  articles: KnowledgeArticle[];
};

type KnowledgeArticle = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  references?: { label: string; url: string }[];
};

// Knowledge base data
const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: "web",
    name: "Web Vulnerabilities",
    icon: <Globe className="h-5 w-5" />,
    description: "Common web application security vulnerabilities",
    articles: [
      {
        id: "xss",
        title: "Cross-Site Scripting (XSS)",
        tags: ["web", "critical", "injection"],
        content: `# Cross-Site Scripting (XSS)

## Overview
Cross-Site Scripting (XSS) is a client-side code injection attack where attackers inject malicious scripts into web pages viewed by users. These scripts execute in the victim's browser, allowing attackers to steal sensitive information, hijack sessions, or perform actions on behalf of the victim.

## Types of XSS
1. **Reflected XSS**: Malicious script is reflected off a web server, such as in search results or error messages.
2. **Stored XSS**: Malicious script is stored on the target server, such as in a database, and later retrieved by victims.
3. **DOM-based XSS**: Vulnerability exists in client-side code rather than server-side code.

## Attack Vectors
- User input fields (search boxes, comment forms, etc.)
- URL parameters
- HTTP headers
- File uploads with HTML content
- Third-party JavaScript libraries

## Prevention Techniques
1. **Input Validation**: Validate all user input on the server side.
2. **Output Encoding**: Encode HTML special characters before displaying user input.
3. **Content Security Policy (CSP)**: Implement strict CSP headers to restrict script execution.
4. **HTTPOnly Cookies**: Prevent JavaScript access to sensitive cookies.
5. **X-XSS-Protection Header**: Enable browser's built-in XSS filter.
6. **Sanitize HTML**: Use libraries to clean HTML content of potentially malicious code.

## Impact
- Account hijacking
- Data theft
- Malware distribution
- Website defacement
- Bypassing CSRF protections`,
        references: [
          { label: "OWASP XSS Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
          { label: "PortSwigger XSS Tutorial", url: "https://portswigger.net/web-security/cross-site-scripting" }
        ]
      },
      {
        id: "sqli",
        title: "SQL Injection",
        tags: ["database", "critical", "injection"],
        content: `# SQL Injection

## Overview
SQL Injection is a code injection technique that exploits vulnerabilities in applications that interact with databases. Attackers insert malicious SQL statements into entry fields, which are then executed by the database.

## Types of SQL Injection
1. **Error-based**: Extract data through error messages
2. **Union-based**: Use UNION operator to combine results from injected query
3. **Blind SQL Injection**: No visible feedback, but can extract data bit by bit
4. **Time-based Blind**: Use time delays to determine if conditions are true/false
5. **Out-of-band**: Extract data through alternative channels (DNS, HTTP requests)

## Common Attack Patterns
- \`' OR 1=1 --\`
- \`' UNION SELECT username, password FROM users --\`
- \`' OR '1'='1\`
- \`'; DROP TABLE users; --\`

## Prevention Techniques
1. **Parameterized Queries**: Use prepared statements with bound parameters
2. **ORM Frameworks**: Utilize Object-Relational Mapping frameworks that handle SQL escaping
3. **Input Validation**: Validate and sanitize all user inputs
4. **Least Privilege**: Run database with minimal required permissions
5. **Stored Procedures**: Use stored procedures to abstract direct database access
6. **WAF**: Implement Web Application Firewalls to detect and block SQL injection attempts

## Impact
- Data theft
- Data manipulation
- Data destruction
- Authentication bypass
- Server compromise`,
        references: [
          { label: "OWASP SQL Injection Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
          { label: "PortSwigger SQL Injection Tutorial", url: "https://portswigger.net/web-security/sql-injection" }
        ]
      }
    ]
  },
  {
    id: "authentication",
    name: "Authentication & Authorization",
    icon: <Lock className="h-5 w-5" />,
    description: "Security issues related to user authentication and authorization",
    articles: [
      {
        id: "auth-bypass",
        title: "Authentication Bypass Techniques",
        tags: ["authentication", "critical"],
        content: `# Authentication Bypass Techniques

## Overview
Authentication bypass vulnerabilities allow attackers to gain unauthorized access to systems by circumventing login mechanisms. These vulnerabilities often result from flawed logic, weak implementations, or insecure configurations.

## Common Bypass Techniques

### 1. Parameter Manipulation
- Manipulating authentication parameters in requests
- Changing user IDs or role parameters in cookies/tokens
- Modifying authentication flow parameters

### 2. Forced Browsing
- Directly accessing protected pages by URL
- Skipping authentication steps in multi-step processes
- Accessing resources without proper authorization checks

### 3. Session Management Attacks
- Session fixation
- Session hijacking
- Weak session ID generation
- Missing session validation

### 4. Logic Flaws
- Race conditions
- Flawed implementation of business rules
- Improper validation of authentication state

### 5. Technical Attacks
- SQL injection in login forms
- Credential stuffing
- Brute force attacks
- Default or weak credentials

## Prevention Techniques
1. **Strong Authentication**: Implement multi-factor authentication
2. **Proper Session Management**: Secure cookie flags, session timeouts, re-authentication for sensitive actions
3. **Server-side Validation**: Never trust client-side controls alone
4. **Defense in Depth**: Multiple layers of security controls
5. **Secure Coding Practices**: Follow secure coding standards
6. **Continuous Testing**: Regular security testing and code reviews

## Impact
- Unauthorized access to sensitive information
- Account takeover
- Privilege escalation
- System compromise
- Data breaches`,
        references: [
          { label: "OWASP Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
          { label: "PortSwigger Authentication Vulnerabilities", url: "https://portswigger.net/web-security/authentication" }
        ]
      }
    ]
  },
  {
    id: "mobile",
    name: "Mobile Security",
    icon: <Terminal className="h-5 w-5" />,
    description: "Security vulnerabilities specific to mobile applications",
    articles: [
      {
        id: "insecure-data-storage",
        title: "Insecure Data Storage",
        tags: ["mobile", "high", "data-protection"],
        content: `# Insecure Data Storage in Mobile Applications

## Overview
Insecure data storage vulnerabilities occur when sensitive information is stored improperly on mobile devices, allowing unauthorized access to that data. This affects both Android and iOS platforms and can lead to significant data breaches.

## Common Vulnerabilities

### 1. Unencrypted Storage
- Storing sensitive data in plaintext
- Using weak encryption algorithms
- Poor key management practices

### 2. Improper Storage Locations
- External storage (SD cards)
- Shared preferences without proper restrictions
- Temporary files not properly secured
- Unprotected SQLite databases
- Log files containing sensitive information

### 3. Data Leakage Channels
- Application backups
- Keyboard caches
- Screenshots in app switcher
- Copy/paste buffers
- Crash logs and analytics

## Detection Methods
1. Static analysis of application code
2. Dynamic analysis through runtime inspection
3. File system analysis on rooted/jailbroken devices
4. Traffic analysis for data transmission
5. Reverse engineering application binaries

## Prevention Techniques
1. **Use Platform Security Features**:
   - iOS: Keychain, Data Protection API
   - Android: EncryptedSharedPreferences, Android Keystore

2. **Encryption Best Practices**:
   - Use strong, industry-standard encryption (AES-256)
   - Implement proper key management
   - Avoid storing encryption keys in the application

3. **Minimize Data Storage**:
   - Only store what's necessary
   - Implement proper data retention policies
   - Securely delete data when no longer needed

4. **Secure Coding Practices**:
   - Avoid hardcoded credentials
   - Implement proper access controls
   - Follow platform-specific security guidelines

## Impact
- Exposure of personal user data
- Financial information compromise
- Authentication credential theft
- Privacy violations
- Compliance violations`,
        references: [
          { label: "OWASP Mobile Top 10", url: "https://owasp.org/www-project-mobile-top-10/" },
          { label: "OWASP Mobile Security Testing Guide", url: "https://owasp.org/www-project-mobile-security-testing-guide/" }
        ]
      }
    ]
  },
  {
    id: "api",
    name: "API Security",
    icon: <Code className="h-5 w-5" />,
    description: "Securing API endpoints and preventing common API vulnerabilities",
    articles: [
      {
        id: "broken-object-level-auth",
        title: "Broken Object Level Authorization",
        tags: ["api", "critical", "authorization"],
        content: `# Broken Object Level Authorization

## Overview
Broken Object Level Authorization (BOLA), also known as Insecure Direct Object Reference (IDOR), is a vulnerability where an application fails to properly validate that a user has permission to access or modify a specific resource. This is one of the most common and high-impact API vulnerabilities.

## Vulnerability Patterns

### 1. Direct Resource Access Without Authorization
- API endpoints that accept IDs without proper permission checks
- Example: \`GET /api/users/123\` where any authenticated user can access any user's data by changing the ID

### 2. Predictable Resource Identifiers
- Sequential IDs (e.g., incremental integers)
- Easily guessable UUIDs or patterns
- Non-random resource identifiers

### 3. Horizontal Privilege Escalation
- User accessing other users' resources at the same permission level
- Example: User A accessing User B's private messages

### 4. Vertical Privilege Escalation
- User accessing resources requiring higher privilege levels
- Example: Regular user accessing admin-only functionality

## Detection Methods
1. **Manual Testing**: Attempting to access resources belonging to other users
2. **Automated Scanning**: Using tools that detect resource access control issues
3. **Code Review**: Examining authorization logic in API implementations
4. **Proxy Interception**: Manipulating request parameters to attempt unauthorized access

## Prevention Techniques
1. **Centralized Authorization**:
   - Implement a centralized authorization mechanism
   - Use policy-based access control frameworks

2. **Proper Resource Ownership Validation**:
   - Always verify resource ownership before granting access
   - Implement user context in every authorization decision

3. **Unpredictable Resource IDs**:
   - Use randomly generated UUIDs instead of sequential IDs
   - Avoid exposing internal IDs directly

4. **Indirect Reference Maps**:
   - Use indirect reference maps to translate between user-visible IDs and internal IDs
   - Maintain per-user context for resource mapping

5. **Testing**:
   - Implement unit and integration tests specifically for authorization checks
   - Regular penetration testing focused on authorization

## Impact
- Unauthorized access to sensitive information
- Data theft or modification
- Privacy violations
- Regulatory compliance issues
- Reputation damage`,
        references: [
          { label: "OWASP API Security Top 10", url: "https://owasp.org/www-project-api-security/" },
          { label: "OWASP API Security - BOLA", url: "https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md" }
        ]
      }
    ]
  },
  {
    id: "secure-coding",
    name: "Secure Coding Practices",
    icon: <Shield className="h-5 w-5" />,
    description: "Best practices for writing secure code across different platforms",
    articles: [
      {
        id: "secure-sdlc",
        title: "Secure Software Development Lifecycle",
        tags: ["process", "secure-coding"],
        content: `# Secure Software Development Lifecycle (SSDLC)

## Overview
The Secure Software Development Lifecycle (SSDLC) is a framework that incorporates security throughout the entire software development process rather than addressing it as an afterthought. It helps organizations build more secure software by identifying and addressing security vulnerabilities early in the development cycle.

## SSDLC Phases

### 1. Planning & Requirements
- Identify security requirements and compliance needs
- Define security objectives
- Create abuse cases alongside use cases
- Perform threat modeling
- Define security architecture

### 2. Design
- Conduct secure design reviews
- Implement defense in depth
- Create security control design
- Apply secure design patterns
- Document security assumptions

### 3. Implementation
- Follow secure coding guidelines
- Use pre-approved, secure libraries
- Conduct regular code reviews
- Perform static application security testing (SAST)
- Enforce peer reviews

### 4. Testing
- Conduct security-focused testing
- Perform dynamic application security testing (DAST)
- Execute penetration testing
- Fuzz testing for edge cases
- Validate security requirements

### 5. Deployment
- Secure configuration management
- Create secure deployment procedures
- Implement secure infrastructure
- Conduct final security review
- Prepare incident response plan

### 6. Maintenance
- Security patch management
- Ongoing security testing
- Security monitoring
- Vulnerability management
- Security incident handling

## Key SSDLC Models
1. **Microsoft SDL**: Microsoft's Security Development Lifecycle
2. **OWASP SAMM**: Software Assurance Maturity Model
3. **NIST 800-64**: Security Considerations in the System Development Life Cycle
4. **BSIMM**: Building Security In Maturity Model
5. **DevSecOps**: Integrating security into DevOps pipelines

## Benefits
- Early identification of security issues
- Reduced remediation costs
- Improved security posture
- Better regulatory compliance
- Enhanced customer trust
- Reduced security incidents

## Implementation Strategies
1. **Start Small**: Begin with high-risk applications
2. **Automation**: Automate security controls where possible
3. **Training**: Provide security training for developers
4. **Tools**: Integrate security tools into development pipeline
5. **Metrics**: Establish security metrics to measure progress
6. **Culture**: Foster a security-conscious culture`,
        references: [
          { label: "OWASP Secure SDLC Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secure_SDLC_Cheat_Sheet.html" },
          { label: "Microsoft Security Development Lifecycle", url: "https://www.microsoft.com/en-us/securityengineering/sdl/" }
        ]
      }
    ]
  }
];

export function KnowledgeBase() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeArticle[]>([]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: KnowledgeArticle[] = [];

    knowledgeCategories.forEach(category => {
      category.articles.forEach(article => {
        if (
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        ) {
          results.push(article);
        }
      });
    });

    setSearchResults(results);
  };

  const openArticle = (article: KnowledgeArticle) => {
    setActiveArticle(article);
    setActiveTab("article");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-matrix/30 hover:bg-matrix/10">
          <Book className="mr-2 h-4 w-4" />
          Knowledge Base
          <ChevronRight className="ml-auto h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl border-matrix/30 bg-black backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-matrix">Security Knowledge Base</DialogTitle>
          <DialogDescription className="text-gray-400">
            Learn about common vulnerabilities, security best practices, and mitigation techniques
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="browse"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-matrix/20">
            <TabsTrigger value="browse" className="font-mono text-sm">Browse Categories</TabsTrigger>
            <TabsTrigger value="search" className="font-mono text-sm">Search</TabsTrigger>
            <TabsTrigger value="article" className="font-mono text-sm" disabled={!activeArticle}>
              {activeArticle ? "Article" : "View Article"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="border border-matrix/20 rounded-md p-4 hover:bg-matrix/5 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-matrix/10 p-2 rounded-md">
                      {category.icon}
                    </div>
                    <h3 className="font-mono text-white">{category.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                  <ul className="space-y-1">
                    {category.articles.map((article) => (
                      <li key={article.id}>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-matrix hover:underline text-left font-normal"
                          onClick={() => openArticle(article)}
                        >
                          {article.title}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  className="bg-black/50 border-matrix/30"
                  placeholder="Search for vulnerabilities, techniques, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button 
                  variant="default" 
                  className="bg-matrix/20 hover:bg-matrix/40 text-matrix border-none"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border border-matrix/20 rounded-md">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? "No results found. Try a different search term." : "Enter a search term to find articles."}
                  </div>
                ) : (
                  <div className="divide-y divide-matrix/10">
                    {searchResults.map((article) => (
                      <div 
                        key={article.id} 
                        className="p-4 hover:bg-matrix/5 cursor-pointer"
                        onClick={() => openArticle(article)}
                      >
                        <h4 className="font-mono text-white mb-1">{article.title}</h4>
                        <div className="flex gap-1 flex-wrap mb-2">
                          {article.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="text-xs bg-black/50 border-matrix/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {article.content.split("\n")[2] || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="article" className="mt-4">
            {activeArticle ? (
              <div className="border border-matrix/20 rounded-md bg-black/30 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-mono text-matrix mb-2">{activeArticle.title}</h2>
                    <div className="flex gap-1 flex-wrap">
                      {activeArticle.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs bg-black/50 border-matrix/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-matrix/30 text-xs"
                    onClick={() => setActiveTab("browse")}
                  >
                    Back to Categories
                  </Button>
                </div>
                
                <ScrollArea className="h-[500px] pr-4">
                  <div className="prose prose-invert prose-headings:text-matrix prose-headings:font-mono max-w-none">
                    {activeArticle.content.split("\n").map((line, index) => {
                      if (line.startsWith("# ")) {
                        return <h1 key={index} className="text-2xl font-bold mt-0">{line.substring(2)}</h1>;
                      } else if (line.startsWith("## ")) {
                        return <h2 key={index} className="text-xl font-bold mt-6">{line.substring(3)}</h2>;
                      } else if (line.startsWith("### ")) {
                        return <h3 key={index} className="text-lg font-bold mt-4">{line.substring(4)}</h3>;
                      } else if (line.startsWith("- ")) {
                        return <li key={index} className="ml-4">{line.substring(2)}</li>;
                      } else if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || 
                                 line.startsWith("4. ") || line.startsWith("5. ") || line.startsWith("6. ")) {
                        return <li key={index} className="ml-4">{line.substring(3)}</li>;
                      } else if (line === "") {
                        return <p key={index}>&nbsp;</p>;
                      } else if (line.startsWith("```")) {
                        return <pre key={index} className="bg-black/50 p-2 rounded border border-matrix/20 mt-2 mb-2 font-mono text-sm overflow-x-auto">{line.substring(3)}</pre>;
                      } else if (line.startsWith("`") && line.endsWith("`")) {
                        return <code key={index} className="bg-black/50 px-1 rounded text-sm font-mono">{line.substring(1, line.length - 1)}</code>;
                      } else {
                        return <p key={index} className="mb-2">{line}</p>;
                      }
                    })}
                    
                    {activeArticle.references && (
                      <div className="mt-8 pt-4 border-t border-matrix/20">
                        <h3 className="text-lg font-bold font-mono text-matrix">References</h3>
                        <ul className="space-y-2 mt-2">
                          {activeArticle.references.map((ref, index) => (
                            <li key={index} className="flex items-center">
                              <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                              <a 
                                href={ref.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-matrix hover:underline text-sm"
                              >
                                {ref.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>No article selected. Browse or search for articles.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}