import { useState } from "react";
import { FileWarning, AlertTriangle, ShieldAlert, KeyRound, Database, Globe, ExternalLink, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KnowledgeBase } from "./knowledge-base";

interface BugReportTemplateProps {
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: "xss",
    label: "Cross-Site Scripting (XSS)",
    icon: <AlertTriangle className="h-4 w-4" />,
    template: `## Vulnerability Description
I've discovered a Cross-Site Scripting (XSS) vulnerability that allows attackers to inject malicious scripts into web pages viewed by users.

## Steps to Reproduce
1. Navigate to [affected page/functionality]
2. Input the following payload into the [input field/parameter]: 
   \`<script>alert(document.cookie)</script>\`
3. [Submit form/Click button/Perform action]
4. The script executes in the context of the application

## Impact
This vulnerability could allow attackers to:
- Steal user cookies and hijack sessions
- Perform actions on behalf of the victim
- Access sensitive information
- Deface the website or redirect users to malicious sites

## Affected Components
- URL/endpoint: [specify URL]
- Parameter: [specify parameter]
- Browser: [specify browser and version]

## Suggestions for Remediation
- Implement proper input validation
- Apply context-appropriate output encoding
- Implement Content Security Policy (CSP) headers
- Consider using frameworks that automatically escape XSS
- Validate and sanitize HTML content`,
  },
  {
    id: "sqli",
    label: "SQL Injection",
    icon: <Database className="h-4 w-4" />,
    template: `## Vulnerability Description
I've discovered a SQL Injection vulnerability that allows attackers to interfere with database queries made by the application.

## Steps to Reproduce
1. Navigate to [affected page/functionality]
2. Input the following payload into the [input field/parameter]:
   \`' OR 1=1 --\`
3. [Submit form/Click button/Perform action]
4. The application reveals [unexpected data/error message/behavior]

## Further Testing
I was able to extract the following information:
- [List any data structures or information discovered]
- [Include any additional testing performed]

## Impact
This vulnerability could allow attackers to:
- Access unauthorized data
- Modify database contents
- Delete database records
- Execute administrative operations
- Potentially gain access to the underlying server

## Affected Components
- URL/endpoint: [specify URL]
- Parameter: [specify parameter]
- Database type: [if known]

## Suggestions for Remediation
- Use parameterized queries or prepared statements
- Implement ORM frameworks
- Apply strict input validation
- Enforce principle of least privilege for database accounts
- Implement proper error handling to avoid leaking technical details`,
  },
  {
    id: "auth-bypass",
    label: "Authentication Bypass",
    icon: <KeyRound className="h-4 w-4" />,
    template: `## Vulnerability Description
I've discovered an authentication bypass vulnerability that allows unauthorized access to protected functionality or resources.

## Steps to Reproduce
1. [Start with the normal authentication flow]
2. [Describe exact steps to bypass authentication control]
3. [Explain how to verify successful bypass]

## Technical Details
The bypass works by:
- [Explain the technical mechanism behind the bypass]
- [Include any relevant request/response details]

## Impact
This vulnerability allows attackers to:
- Access protected resources without authentication
- Bypass security controls
- [Other specific impacts]

## Affected Components
- URL/endpoint: [specify URL]
- Feature: [specify feature/functionality]
- User role: [if specific to certain roles]

## Suggestions for Remediation
- Implement consistent authentication checks across all protected resources
- Enforce server-side validation of authentication state
- Consider implementing multi-factor authentication
- Review and refactor authentication logic
- Implement proper session management`,
  },
  {
    id: "ssrf",
    label: "Server-Side Request Forgery (SSRF)",
    icon: <Globe className="h-4 w-4" />,
    template: `## Vulnerability Description
I've discovered a Server-Side Request Forgery (SSRF) vulnerability that allows an attacker to induce the server to make requests to an unintended location.

## Steps to Reproduce
1. Navigate to [affected page/functionality]
2. Input the following URL into the [input field/parameter]:
   \`http://internal-service.local\` or \`http://localhost:port\`
3. [Submit form/Click button/Perform action]
4. The server makes a request to the specified internal resource

## Technical Details
- [Details about the request being made]
- [Any filters or restrictions observed]
- [Any successful bypasses discovered]

## Impact
This vulnerability could allow attackers to:
- Access internal services not exposed to the internet
- Bypass network access controls
- Perform port scanning of internal networks
- Access metadata services in cloud environments
- Execute command & control operations

## Affected Components
- URL/endpoint: [specify URL]
- Parameter: [specify parameter]
- Feature: [specify feature/functionality]

## Suggestions for Remediation
- Implement a whitelist of allowed domains/IPs
- Use a URL parser and validate each component
- Disable redirects or limit redirect chains
- Block requests to private IP ranges
- Consider using a dedicated service for external resource fetching`,
  },
  {
    id: "idor",
    label: "Insecure Direct Object Reference (IDOR)",
    icon: <ShieldAlert className="h-4 w-4" />,
    template: `## Vulnerability Description
I've discovered an Insecure Direct Object Reference (IDOR) vulnerability that allows access to resources belonging to other users or restricted resources.

## Steps to Reproduce
1. Login as [User A]
2. Navigate to [affected page/functionality]
3. Observe the [ID/reference] in the request: [original ID]
4. Change the [ID/reference] to [different ID]: [modified ID]
5. [Submit request/Reload page]
6. Observe that data belonging to [another user/restricted resource] is accessible

## Technical Details
- [Explain how object references are exposed]
- [Detail any attempts to obfuscate IDs and how they were bypassed]
- [Include HTTP requests/responses if relevant]

## Impact
This vulnerability allows attackers to:
- Access other users' private data
- Modify information belonging to other users
- Access restricted functionality or resources
- [Other specific impacts]

## Affected Components
- URL/endpoint: [specify URL]
- Parameter: [specify parameter]
- Feature: [specify feature/functionality]

## Suggestions for Remediation
- Implement proper authorization checks for all resource accesses
- Use indirect references that are specific to the user's session
- Verify object ownership before allowing operations
- Consider using UUIDs instead of sequential or predictable IDs
- Implement proper access control lists`,
  },
  {
    id: "open-redirect",
    label: "Open Redirect",
    icon: <ExternalLink className="h-4 w-4" />,
    template: `## Vulnerability Description
I've discovered an Open Redirect vulnerability that allows attackers to redirect users to arbitrary external websites.

## Steps to Reproduce
1. Navigate to [affected page/functionality]
2. Modify the [redirect parameter] to point to an external domain:
   \`https://example.com/login?redirect=https://attacker.com\`
3. [Complete action that triggers redirect]
4. User is redirected to the external site

## Technical Details
- [Explain which parameters are vulnerable]
- [Detail any validation attempted by the application]
- [Include any bypass techniques discovered]

## Impact
This vulnerability could allow attackers to:
- Conduct convincing phishing attacks
- Redirect users to malicious websites
- Exploit users' trust in your domain
- Lead to further exploitation when combined with other vulnerabilities

## Affected Components
- URL/endpoint: [specify URL]
- Parameter: [specify parameter]
- Feature: [specify feature/functionality]

## Suggestions for Remediation
- Implement a whitelist of allowed redirect destinations
- Use relative URLs for internal redirects
- If external redirects are necessary, implement an intermediate confirmation page
- Validate redirect URLs against a strict pattern
- Consider using signed redirect URLs for sensitive operations`,
  },
  {
    id: "custom",
    label: "Custom (blank template)",
    icon: <FileWarning className="h-4 w-4" />,
    template: `## Vulnerability Description
[Provide a clear and concise description of the vulnerability]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]
[Add as many steps as needed]

## Technical Details
[Provide any technical details, code snippets, or screenshots that help explain the vulnerability]

## Impact
[Describe the potential impact of this vulnerability, including what an attacker might be able to accomplish]

## Affected Components
- URL/endpoint: [specify URL]
- Parameter: [specify parameter]
- Feature: [specify feature/functionality]
- Environment: [specify environment]

## Suggestions for Remediation
[Provide constructive suggestions on how to fix the vulnerability]`,
  },
];

export function BugReportTemplates({ onSelectTemplate }: BugReportTemplateProps) {
  const handleSelectTemplate = (template: string) => {
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-sm font-mono text-dim-gray mb-1">Report Templates</h3>
          <p className="text-xs text-dim-gray/70">
            Use a template to quickly create a well-structured bug report
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="border-matrix/30 hover:bg-matrix/10"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Select Template
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-terminal border border-matrix/30">
              <DropdownMenuLabel className="font-mono text-xs text-dim-gray">Vulnerability Templates</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-matrix/20" />
              {templates.map((template) => (
                <DropdownMenuItem 
                  key={template.id}
                  className="cursor-pointer font-mono text-sm hover:bg-matrix/10 flex items-center"
                  onClick={() => handleSelectTemplate(template.template)}
                >
                  <span className="mr-2">{template.icon}</span>
                  {template.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <KnowledgeBase />
        </div>
      </div>
    </div>
  );
}