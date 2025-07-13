import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, log } from "./vite";
import { getAdminSessions } from "./index";
import { gradeVulnerability } from "./vulnerability-grading";
import { storage } from "./storage";
import { insertPublicMessageSchema } from "../shared/schema";

import bcrypt from 'bcrypt'; // Importing bcrypt

export function registerRoutes(app: Express): Server {
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

  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, userType } = req.body;

      // Validate input
      if (!username || !email || !password || !userType) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Check if username is taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        userType,
        ...req.body // Include additional fields like companyName, etc.
      });

      // Set session
      req.session.user = { id: newUser.id };

      // Return the user object (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public Chat endpoints
  app.get("/api/public-chat", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await storage.getPublicMessages(limit, offset);
      res.json(messages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error("Error fetching public messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/public-chat", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validation = insertPublicMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid message data",
          details: validation.error.errors
        });
      }

      const { content, messageType = "message" } = validation.data;

      // Basic content validation
      if (!content.trim()) {
        return res.status(400).json({ error: "Message cannot be empty" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ error: "Message too long (max 1000 characters)" });
      }

      // Only companies can post announcements
      if (messageType === "announcement" && req.session.user.userType !== "company") {
        return res.status(403).json({ error: "Only companies can post announcements" });
      }

      const message = await storage.createPublicMessage({
        content: content.trim(),
        messageType,
        userId: req.session.user.id
      });

      if (!message) {
        return res.status(500).json({ error: "Failed to create message" });
      }

      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating public message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/public-chat/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: "Invalid message ID" });
      }

      const deleted = await storage.deletePublicMessage(messageId, req.session.user.id);

      if (!deleted) {
        return res.status(404).json({ error: "Message not found or not authorized" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting public message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Triage Service Routes
  
  // Get company triage services
  app.get("/api/triage-services", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const services = await storage.getTriageServicesByCompany(user.id);
      res.json(services);
    } catch (error) {
      console.error("Error fetching triage services:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new triage service
  app.post("/api/triage-services", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const serviceData = {
        ...req.body,
        companyId: user.id
      };

      const service = await storage.createTriageService(serviceData);
      if (!service) {
        return res.status(500).json({ error: "Failed to create triage service" });
      }

      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating triage service:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update triage service
  app.put("/api/triage-services/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ error: "Invalid service ID" });
      }

      const service = await storage.updateTriageService(serviceId, req.body);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      console.error("Error updating triage service:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get triage reports for company
  app.get("/api/triage-reports", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const reports = await storage.getTriageReportsByCompany(user.id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching triage reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific triage report
  app.get("/api/triage-reports/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }

      const report = await storage.getTriageReport(reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // Check if user has access to this report
      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType === 'company' && report.companyId !== user.id)) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error fetching triage report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create triage report for submission
  app.post("/api/triage-reports", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const { submissionId, triageServiceId } = req.body;
      
      // Check if submission exists and belongs to the company
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      // Check if triage report already exists for this submission
      const existingReport = await storage.getTriageReportBySubmission(submissionId);
      if (existingReport) {
        return res.status(400).json({ error: "Triage report already exists for this submission" });
      }

      // Assign to available analyst
      const availableAnalysts = await storage.getAvailableTriageAnalysts();
      const analyst = availableAnalysts[0]; // Get the best available analyst

      const reportData = {
        submissionId,
        triageServiceId,
        companyId: user.id,
        triageAnalystId: analyst?.id,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        triageStartedAt: new Date()
      };

      const report = await storage.createTriageReport(reportData);
      if (!report) {
        return res.status(500).json({ error: "Failed to create triage report" });
      }

      // Update analyst workload if assigned
      if (analyst) {
        await storage.updateTriageAnalystWorkload(analyst.id, analyst.currentWorkload + 1);
      }

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating triage report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update triage report (for analysts)
  app.put("/api/triage-reports/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }

      const report = await storage.updateTriageReport(reportId, req.body);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error updating triage report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get triage communications
  app.get("/api/triage-communications/:reportId", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const reportId = parseInt(req.params.reportId);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }

      const communications = await storage.getTriageCommunications(reportId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching triage communications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create triage communication
  app.post("/api/triage-communications", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const communicationData = {
        ...req.body,
        fromUserId: req.session.user.id
      };

      const communication = await storage.createTriageCommunication(communicationData);
      if (!communication) {
        return res.status(500).json({ error: "Failed to create communication" });
      }

      res.status(201).json(communication);
    } catch (error) {
      console.error("Error creating triage communication:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get triage subscriptions
  app.get("/api/triage-subscriptions", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const subscriptions = await storage.getTriageSubscriptionsByCompany(user.id);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching triage subscriptions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create triage subscription
  app.post("/api/triage-subscriptions", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const subscriptionData = {
        ...req.body,
        companyId: user.id
      };

      const subscription = await storage.createTriageSubscription(subscriptionData);
      if (!subscription) {
        return res.status(500).json({ error: "Failed to create subscription" });
      }

      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating triage subscription:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route: Get all triage reports (for analysts)
  app.get("/api/admin/triage-reports", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      // If user is an analyst, get their assigned reports
      if (user.userType === 'analyst') {
        const analyst = await storage.getTriageAnalystByUserId(user.id);
        if (!analyst) {
          return res.status(404).json({ error: "Analyst profile not found" });
        }
        const reports = await storage.getTriageReportsByAnalyst(analyst.id);
        res.json(reports);
      } else {
        // Admin can see all reports - would need to implement getAllTriageReports
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching admin triage reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auto-assign triage on submission creation
  app.post("/api/submissions", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const submissionData = {
        ...req.body,
        userId: req.session.user.id
      };

      const submission = await storage.createSubmission(submissionData);
      if (!submission) {
        return res.status(500).json({ error: "Failed to create submission" });
      }

      // Check if the program has auto-triage enabled
      const program = await storage.getProgram(submission.programId);
      if (program) {
        // Look for company's triage services
        const services = await storage.getTriageServicesByCompany(program.companyId || 0);
        const autoTriageService = services.find(s => s.autoAssignTriage && s.isActive);
        
        if (autoTriageService) {
          // Auto-create triage report
          const availableAnalysts = await storage.getAvailableTriageAnalysts();
          const analyst = availableAnalysts[0];

          const reportData = {
            submissionId: submission.id,
            triageServiceId: autoTriageService.id,
            companyId: autoTriageService.companyId,
            triageAnalystId: analyst?.id,
            status: 'pending',
            priority: 'medium',
            dueDate: new Date(Date.now() + (autoTriageService.responseTimeHours || 24) * 60 * 60 * 1000),
            triageStartedAt: new Date()
          };

          await storage.createTriageReport(reportData);
          
          if (analyst) {
            await storage.updateTriageAnalystWorkload(analyst.id, analyst.currentWorkload + 1);
          }
        }
      }

      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const server = createServer(app);
  return server;
}