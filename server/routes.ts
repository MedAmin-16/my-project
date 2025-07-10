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
      const userId = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        userType
      });

      res.json({ message: "User created successfully", userId });
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

  // Triage Service endpoints
  app.post("/api/triage-service", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Only companies can create triage services
      if (req.session.user.userType !== "company") {
        return res.status(403).json({ error: "Only companies can request triage services" });
      }

      const { servicePlan, pricePerReport, monthlyFee, settings } = req.body;

      if (!servicePlan) {
        return res.status(400).json({ error: "Service plan is required" });
      }

      // Check if company already has a triage service
      const existingService = await storage.getTriageServiceByCompany(req.session.user.id);
      if (existingService) {
        return res.status(400).json({ error: "Company already has a triage service" });
      }

      const service = await storage.createTriageService({
        companyId: req.session.user.id,
        servicePlan,
        pricePerReport: pricePerReport || null,
        monthlyFee: monthlyFee || null,
        settings: settings || null
      });

      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating triage service:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/triage-service", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (req.session.user.userType === "company") {
        // Companies can only see their own service
        const service = await storage.getTriageServiceByCompany(req.session.user.id);
        res.json(service);
      } else {
        // Admin/triage specialists can see all services
        const services = await storage.getAllTriageServices();
        res.json(services);
      }
    } catch (error) {
      console.error("Error getting triage services:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/triage-reports", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { status, limit, offset } = req.query;
      const filters: any = {};

      if (status) filters.status = status as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      // Filter based on user type
      if (req.session.user.userType === "company") {
        filters.companyId = req.session.user.id;
      } else if (req.session.user.userType === "hacker") {
        // Hackers can only see reports for their submissions
        // This would need additional filtering in storage method
      }

      const reports = await storage.getTriageReports(filters);
      res.json(reports);
    } catch (error) {
      console.error("Error getting triage reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/triage-reports", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Only admin/triage specialists can create triage reports
      if (req.session.user.userType !== "admin") {
        return res.status(403).json({ error: "Only admin can create triage reports" });
      }

      const { submissionId, triageServiceId, priority, triageNotes } = req.body;

      if (!submissionId || !triageServiceId) {
        return res.status(400).json({ error: "Submission ID and triage service ID are required" });
      }

      const report = await storage.createTriageReport({
        submissionId,
        triageServiceId,
        triageSpecialistId: req.session.user.id,
        priority: priority || "medium",
        triageNotes: triageNotes || ""
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating triage report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/triage-reports/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Only admin/triage specialists can update triage reports
      if (req.session.user.userType !== "admin") {
        return res.status(403).json({ error: "Only admin can update triage reports" });
      }

      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }

      const updates = req.body;
      const updatedReport = await storage.updateTriageReport(reportId, updates);

      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating triage report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/triage-communications", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { triageReportId, recipientType, subject, message, messageType, isInternal } = req.body;

      if (!triageReportId || !recipientType || !message) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const communication = await storage.createTriageCommunication({
        triageReportId,
        fromUserId: req.session.user.id,
        recipientType,
        subject: subject || "",
        message,
        messageType: messageType || "update",
        isInternal: isInternal || false
      });

      res.status(201).json(communication);
    } catch (error) {
      console.error("Error creating triage communication:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

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
      console.error("Error getting triage communications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/triage-team", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Only admin can view triage team
      if (req.session.user.userType !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const team = await storage.getTriageTeam();
      res.json(team);
    } catch (error) {
      console.error("Error getting triage team:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const server = createServer(app);
  return server;
}