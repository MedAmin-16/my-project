import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, log } from "./vite";
import { getAdminSessions } from "./index";
import { gradeVulnerability } from "./vulnerability-grading";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes first
  setupAuth(app);
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vulnerability grading endpoint
  app.post("/api/grade-vulnerability", (req, res) => {
    try {
      const { vulnerabilityType, description, affectsAdmin, allowsCodeExecution, allowsDataAccess } = req.body;

      if (!vulnerabilityType) {
        return res.status(400).json({ 
          error: "Missing required field: vulnerabilityType" 
        });
      }

      const grading = gradeVulnerability({
        vulnerabilityType,
        description: description || "",
        affectsAdmin: affectsAdmin || false,
        allowsCodeExecution: allowsCodeExecution || false,
        allowsDataAccess: allowsDataAccess || false
      });

      res.json(grading);
    } catch (error) {
      console.error("Error grading vulnerability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin authentication endpoints
  const adminSessions = getAdminSessions();

  app.post("/api/admin/login", (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Hard-coded admin credentials for demo
      const adminEmail = "admin@cyberhunt.com";
      const adminPassword = "AdminSecure123!";

      if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate a simple token
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session
      adminSessions.set(token, {
        email: adminEmail,
        loginTime: Date.now()
      });

      res.json({
        message: "Login successful",
        token: token,
        user: { email: adminEmail, role: "admin" }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/verify", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const session = adminSessions.get(token);
      const now = Date.now();
      const sessionAge = now - session!.loginTime;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        adminSessions.delete(token);
        return res.status(401).json({ message: "Session expired" });
      }

      res.json({ 
        message: "Valid session",
        user: { email: session!.email, role: "admin" }
      });
    } catch (error) {
      console.error("Admin verify error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (token) {
        adminSessions.delete(token);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock admin stats
      res.json({
        totalUsers: 1250,
        totalPrograms: 45,
        totalSubmissions: 892,
        totalEarnings: 125000,
        pendingReviews: 23,
        activePrograms: 38
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/users", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock users data
      res.json([]);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment System Routes
  
  // Get comments for a submission
  app.get("/api/submissions/:submissionId/comments", (req, res) => {
    try {
      const { submissionId } = req.params;
      
      if (!submissionId || isNaN(Number(submissionId))) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      // Mock comments data with nested structure
      const mockComments = [
        {
          id: 1,
          content: "Thanks for the report! We're reviewing this vulnerability.",
          submissionId: Number(submissionId),
          userId: 2,
          parentId: null,
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: 2,
            username: "security-team",
            userType: "company"
          },
          replies: [
            {
              id: 3,
              content: "Looking forward to your feedback!",
              submissionId: Number(submissionId),
              userId: 1,
              parentId: 1,
              isEdited: false,
              editedAt: null,
              createdAt: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
              updatedAt: new Date(Date.now() - 82800000).toISOString(),
              user: {
                id: 1,
                username: "researcher123",
                userType: "hacker"
              },
              replies: []
            }
          ]
        },
        {
          id: 2,
          content: "I've attached additional proof-of-concept code that demonstrates the severity of this issue.",
          submissionId: Number(submissionId),
          userId: 1,
          parentId: null,
          isEdited: true,
          editedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          createdAt: new Date(Date.now() - 50400000).toISOString(), // 14 hours ago
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          user: {
            id: 1,
            username: "researcher123",
            userType: "hacker"
          },
          replies: []
        }
      ];

      res.json(mockComments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add a new comment
  app.post("/api/submissions/:submissionId/comments", (req, res) => {
    try {
      const { submissionId } = req.params;
      const { content, parentId } = req.body;

      if (!submissionId || isNaN(Number(submissionId))) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ message: "Comment too long" });
      }

      // Mock user (in real app, get from auth middleware)
      const mockUser = {
        id: 1,
        username: "researcher123",
        userType: "hacker"
      };

      // Create new comment
      const newComment = {
        id: Date.now(), // Mock ID
        content: content.trim(),
        submissionId: Number(submissionId),
        userId: mockUser.id,
        parentId: parentId || null,
        isEdited: false,
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
        replies: []
      };

      // In real app: save to database, send notifications, etc.
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a comment
  app.put("/api/comments/:commentId", (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      if (!commentId || isNaN(Number(commentId))) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ message: "Comment too long" });
      }

      // Mock updated comment
      const updatedComment = {
        id: Number(commentId),
        content: content.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(updatedComment);
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a comment
  app.delete("/api/comments/:commentId", (req, res) => {
    try {
      const { commentId } = req.params;

      if (!commentId || isNaN(Number(commentId))) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      // In real app: check ownership, mark as deleted, etc.
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark comments as read for a submission
  app.post("/api/submissions/:submissionId/comments/mark-read", (req, res) => {
    try {
      const { submissionId } = req.params;

      if (!submissionId || isNaN(Number(submissionId))) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      // In real app: update last_read_at for user

      res.json({ message: "Comments marked as read" });
    } catch (error) {
      console.error("Mark comments read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public Chat Routes
  
  // Get public chat messages
  app.get("/api/public-chat/messages", (req, res) => {
    try {
      const { limit = "50", before } = req.query;
      
      const limitNum = Math.min(Number(limit) || 50, 100); // Max 100 messages

      // Mock messages data
      const mockMessages = [
        {
          id: 1,
          content: "🚀 Excited to announce our new Web Application Security Program! Higher rewards for critical vulnerabilities.",
          userId: 10,
          messageType: "announcement",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          user: {
            id: 10,
            username: "TechCorpSecurity",
            userType: "company"
          }
        },
        {
          id: 2,
          content: "Has anyone tested the new authentication flows? Looking for collaboration on some findings.",
          userId: 5,
          messageType: "message",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: 5,
            username: "SecurityResearcher42",
            userType: "hacker"
          }
        },
        {
          id: 3,
          content: "Great job to everyone who participated in last month's contest! Looking forward to the next one.",
          userId: 8,
          messageType: "message",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          updatedAt: new Date(Date.now() - 900000).toISOString(),
          user: {
            id: 8,
            username: "EliteHunter",
            userType: "hacker"
          }
        },
        {
          id: 4,
          content: "📢 New bounty program launching next week - Mobile App Security. Stay tuned for details!",
          userId: 12,
          messageType: "announcement",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          updatedAt: new Date(Date.now() - 300000).toISOString(),
          user: {
            id: 12,
            username: "StartupCorp",
            userType: "company"
          }
        }
      ];

      // Sort by creation date (newest first for display, but return in chronological order)
      const sortedMessages = mockMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      res.json(sortedMessages.slice(-limitNum));
    } catch (error) {
      console.error("Get public messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Post a new public message
  app.post("/api/public-chat/messages", (req, res) => {
    try {
      const { content, messageType = "message" } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: "Message too long" });
      }

      // Mock user (in real app, get from auth middleware)
      const mockUser = {
        id: 1,
        username: "researcher123",
        userType: "hacker"
      };

      // Validate message type
      if (!["message", "announcement"].includes(messageType)) {
        return res.status(400).json({ message: "Invalid message type" });
      }

      // Only companies can post announcements
      if (messageType === "announcement" && mockUser.userType !== "company") {
        return res.status(403).json({ message: "Only companies can post announcements" });
      }

      // Create new message
      const newMessage = {
        id: Date.now(), // Mock ID
        content: content.trim(),
        userId: mockUser.id,
        messageType,
        isEdited: false,
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser
      };

      // In real app: save to database, broadcast to connected clients, etc.
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Post public message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a public message
  app.put("/api/public-chat/messages/:messageId", (req, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      if (!messageId || isNaN(Number(messageId))) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: "Message too long" });
      }

      // Mock updated message
      const updatedMessage = {
        id: Number(messageId),
        content: content.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(updatedMessage);
    } catch (error) {
      console.error("Update public message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a public message
  app.delete("/api/public-chat/messages/:messageId", (req, res) => {
    try {
      const { messageId } = req.params;

      if (!messageId || isNaN(Number(messageId))) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      // In real app: check ownership, mark as deleted, etc.
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete public message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Triage Service Routes

  // Get available triage services
  app.get("/api/triage/services", (req, res) => {
    try {
      // Mock triage services
      const services = [
        {
          id: 1,
          name: "Basic Triage",
          description: "Essential vulnerability validation and prioritization",
          pricingModel: "per_report",
          pricePerReport: 9900, // $99
          monthlyPrice: null,
          isActive: true,
          features: [
            "Vulnerability validation",
            "Severity assessment",
            "Risk categorization",
            "Basic recommendations",
            "24-48h turnaround"
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Professional Triage",
          description: "Comprehensive analysis with detailed reporting",
          pricingModel: "per_report",
          pricePerReport: 19900, // $199
          monthlyPrice: null,
          isActive: true,
          features: [
            "All Basic features",
            "Detailed technical analysis",
            "Reproduction verification",
            "Business impact assessment",
            "Remediation guidance",
            "12-24h turnaround"
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: "Enterprise Triage",
          description: "Full-service managed vulnerability program",
          pricingModel: "monthly",
          pricePerReport: null,
          monthlyPrice: 299900, // $2999
          isActive: true,
          features: [
            "All Professional features",
            "Dedicated triage team",
            "Real-time communication",
            "Custom reporting",
            "Integration support",
            "4-8h turnaround",
            "Monthly strategy calls"
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      res.json(services);
    } catch (error) {
      console.error("Get triage services error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get company's triage subscription
  app.get("/api/triage/subscription", (req, res) => {
    try {
      // Mock subscription for authenticated company
      const subscription = {
        id: 1,
        companyId: 1,
        triageServiceId: 2,
        status: "active",
        billingModel: "per_report",
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: null,
        autoRenew: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        triageService: {
          id: 2,
          name: "Professional Triage",
          description: "Comprehensive analysis with detailed reporting",
          pricingModel: "per_report",
          pricePerReport: 19900
        }
      };

      res.json(subscription);
    } catch (error) {
      console.error("Get triage subscription error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Subscribe to triage service
  app.post("/api/triage/subscribe", (req, res) => {
    try {
      const { triageServiceId, billingModel } = req.body;

      if (!triageServiceId || !billingModel) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Mock subscription creation
      const subscription = {
        id: Date.now(),
        companyId: 1, // Mock company ID
        triageServiceId,
        status: "active",
        billingModel,
        startDate: new Date().toISOString(),
        endDate: null,
        autoRenew: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(subscription);
    } catch (error) {
      console.error("Subscribe to triage error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get triage requests for a company
  app.get("/api/triage/requests", (req, res) => {
    try {
      const { status, priority, limit = "50" } = req.query;

      // Mock triage requests
      const requests = [
        {
          id: 1,
          submissionId: 1,
          companyId: 1,
          triageServiceId: 2,
          status: "completed",
          priority: "high",
          assignedTriagerId: 1,
          estimatedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          actualCompletionDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          cost: 19900,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          submission: {
            id: 1,
            title: "SQL Injection in Login Form",
            type: "SQL Injection",
            severity: "High"
          },
          company: {
            id: 1,
            username: "techcorp",
            companyName: "TechCorp Inc."
          },
          triageService: {
            id: 2,
            name: "Professional Triage"
          },
          assignedTriager: {
            id: 1,
            username: "lead_triager"
          },
          report: {
            id: 1,
            validationStatus: "valid",
            riskLevel: "high",
            severityAssessment: "Critical business risk requiring immediate attention"
          }
        },
        {
          id: 2,
          submissionId: 2,
          companyId: 1,
          triageServiceId: 2,
          status: "in_progress",
          priority: "medium",
          assignedTriagerId: 2,
          estimatedCompletionDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          actualCompletionDate: null,
          cost: 19900,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          submission: {
            id: 2,
            title: "XSS in User Profile",
            type: "Cross-Site Scripting",
            severity: "Medium"
          },
          company: {
            id: 1,
            username: "techcorp",
            companyName: "TechCorp Inc."
          },
          triageService: {
            id: 2,
            name: "Professional Triage"
          },
          assignedTriager: {
            id: 2,
            username: "senior_triager"
          }
        }
      ];

      // Apply filters
      let filteredRequests = requests;
      if (status) {
        filteredRequests = filteredRequests.filter(r => r.status === status);
      }
      if (priority) {
        filteredRequests = filteredRequests.filter(r => r.priority === priority);
      }

      res.json(filteredRequests.slice(0, parseInt(limit as string)));
    } catch (error) {
      console.error("Get triage requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a triage request
  app.post("/api/triage/requests", (req, res) => {
    try {
      const { submissionId, triageServiceId, priority = "medium" } = req.body;

      if (!submissionId || !triageServiceId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Mock triage request creation
      const triageRequest = {
        id: Date.now(),
        submissionId,
        companyId: 1, // Mock company ID
        triageServiceId,
        status: "pending",
        priority,
        assignedTriagerId: null,
        estimatedCompletionDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        actualCompletionDate: null,
        cost: 19900, // Mock cost
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(triageRequest);
    } catch (error) {
      console.error("Create triage request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get triage report
  app.get("/api/triage/reports/:requestId", (req, res) => {
    try {
      const { requestId } = req.params;

      if (!requestId || isNaN(Number(requestId))) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      // Mock triage report
      const report = {
        id: 1,
        triageRequestId: Number(requestId),
        severityAssessment: "This SQL injection vulnerability poses a critical security risk to the application. The vulnerability allows attackers to bypass authentication and potentially access sensitive database information.",
        riskLevel: "critical",
        validationStatus: "valid",
        exploitability: "high",
        businessImpact: "High - Potential for data breach, compliance violations, and reputational damage. Estimated financial impact could range from $50K to $500K depending on data accessed.",
        technicalAnalysis: `
**Vulnerability Type**: SQL Injection
**Location**: /login endpoint, username parameter
**Attack Vector**: Classic SQL injection using UNION-based attacks
**Database**: MySQL 8.0
**Privileges**: The application database user has elevated privileges allowing read access to sensitive tables.

**Technical Details**:
- Parameter: username
- Payload: admin' UNION SELECT 1,username,password FROM users--
- Response: Returns user credentials in JSON format
- Authentication bypass confirmed through multiple test cases
        `,
        reproductionSteps: `
1. Navigate to the login page at /login
2. In the username field, enter: admin' UNION SELECT 1,username,password FROM users--
3. Enter any value in the password field
4. Submit the form
5. Observe that the application returns user credentials instead of an authentication error
6. Use the returned admin credentials to log in successfully
        `,
        recommendedActions: `
**Immediate Actions (Within 24 hours)**:
1. Implement prepared statements/parameterized queries for all SQL operations
2. Apply input validation and sanitization on the username parameter
3. Deploy emergency patch to production environment
4. Monitor for any suspicious login activities in recent logs

**Short-term Actions (Within 1 week)**:
1. Conduct comprehensive code review for similar vulnerabilities
2. Implement database user privilege reduction
3. Add Web Application Firewall (WAF) rules to detect SQL injection attempts
4. Update logging to capture and alert on injection attempts

**Long-term Actions (Within 1 month)**:
1. Implement comprehensive security testing in CI/CD pipeline
2. Conduct penetration testing of the entire application
3. Provide security training for development team
4. Establish secure coding guidelines and review processes
        `,
        timelineRecommendation: "Critical - Fix within 24 hours. This vulnerability should be treated as a P0 security incident due to its potential for immediate exploitation and data breach.",
        additionalNotes: `
**Researcher Communication**: 
The researcher provided a comprehensive report with clear reproduction steps and demonstrated professionalism. Recommend expedited payment upon fix verification.

**Compliance Considerations**:
- GDPR: Potential for personal data exposure
- PCI DSS: If payment data is accessible, this could impact compliance
- SOX: Financial data may be at risk

**Testing Environment**:
Vulnerability confirmed in both staging and production environments using automated and manual testing techniques.
        `,
        attachments: [
          { name: "sql_injection_poc.png", type: "image/png" },
          { name: "database_dump_sample.txt", type: "text/plain" },
          { name: "vulnerability_scan_results.pdf", type: "application/pdf" }
        ],
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        triageRequest: {
          id: Number(requestId),
          status: "completed",
          priority: "critical",
          submission: {
            id: 1,
            title: "SQL Injection in Login Form",
            type: "SQL Injection",
            severity: "Critical"
          },
          assignedTriager: {
            id: 1,
            username: "lead_triager"
          }
        }
      };

      res.json(report);
    } catch (error) {
      console.error("Get triage report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get triage communications
  app.get("/api/triage/communications/:requestId", (req, res) => {
    try {
      const { requestId } = req.params;

      if (!requestId || isNaN(Number(requestId))) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      // Mock communications
      const communications = [
        {
          id: 1,
          triageRequestId: Number(requestId),
          fromUserId: 1,
          toUserId: 2,
          messageType: "status_update",
          subject: "Triage Request Assigned",
          content: "Your vulnerability report has been assigned to our senior security analyst. We'll begin the analysis process immediately.",
          isInternal: false,
          readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          fromUser: { id: 1, username: "triage_system", userType: "admin" }
        },
        {
          id: 2,
          triageRequestId: Number(requestId),
          fromUserId: 1,
          toUserId: 2,
          messageType: "clarification",
          subject: "Additional Information Required",
          content: "We need some clarification regarding the database version you tested against. Could you provide the MySQL version information from your testing environment?",
          isInternal: false,
          readAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          fromUser: { id: 1, username: "lead_triager", userType: "admin" }
        },
        {
          id: 3,
          triageRequestId: Number(requestId),
          fromUserId: 2,
          toUserId: 1,
          messageType: "clarification",
          subject: "Re: Additional Information Required",
          content: "The testing was performed against MySQL 8.0.28. I've also verified the vulnerability exists in MySQL 5.7.x versions. Let me know if you need any other details.",
          isInternal: false,
          readAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          fromUser: { id: 2, username: "researcher123", userType: "hacker" }
        },
        {
          id: 4,
          triageRequestId: Number(requestId),
          fromUserId: 1,
          toUserId: 2,
          messageType: "report_ready",
          subject: "Triage Report Complete",
          content: "Your vulnerability has been successfully validated and triaged. The complete triage report is now available in your dashboard. We've classified this as a critical severity issue requiring immediate attention.",
          isInternal: false,
          readAt: null,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          fromUser: { id: 1, username: "lead_triager", userType: "admin" }
        }
      ];

      res.json(communications);
    } catch (error) {
      console.error("Get triage communications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send triage communication
  app.post("/api/triage/communications", (req, res) => {
    try {
      const { triageRequestId, toUserId, messageType, subject, content, isInternal = false } = req.body;

      if (!triageRequestId || !messageType || !subject || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Mock communication creation
      const communication = {
        id: Date.now(),
        triageRequestId,
        fromUserId: 1, // Mock current user
        toUserId: toUserId || null,
        messageType,
        subject,
        content,
        isInternal,
        readAt: null,
        createdAt: new Date().toISOString(),
        fromUser: { id: 1, username: "triage_admin", userType: "admin" }
      };

      res.status(201).json(communication);
    } catch (error) {
      console.error("Send triage communication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get triage dashboard stats
  app.get("/api/triage/dashboard/stats", (req, res) => {
    try {
      const stats = {
        totalRequests: 156,
        pendingRequests: 23,
        inProgressRequests: 15,
        completedRequests: 118,
        averageCompletionTime: "18.5 hours",
        customerSatisfactionRating: 4.8,
        monthlyRevenue: 45670,
        activeSubscriptions: 28,
        topTriager: {
          name: "lead_triager",
          completedRequests: 45,
          avgRating: 4.9
        },
        recentActivity: [
          {
            id: 1,
            type: "request_completed",
            message: "Triage request #156 completed by lead_triager",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            type: "new_subscription",
            message: "New enterprise subscription activated for StartupCorp",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: "request_assigned",
            message: "Triage request #157 assigned to senior_triager",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      res.json(stats);
    } catch (error) {
      console.error("Get triage dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const server = createServer(app);
  return server;
}