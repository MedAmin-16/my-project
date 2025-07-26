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

  // Moderation System Routes

  // Get moderation team members
  app.get("/api/moderation/team", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const department = req.query.department as string;
      const members = await storage.getModerationTeamMembers(department);
      res.json(members);
    } catch (error) {
      console.error("Error fetching moderation team:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add moderation team member
  app.post("/api/moderation/team", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const member = await storage.createModerationTeamMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating moderation team member:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get moderation reviews
  app.get("/api/moderation/reviews", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const filters = {
        reviewerId: req.query.reviewer_id ? parseInt(req.query.reviewer_id as string) : undefined,
        status: req.query.status as string,
        priority: req.query.priority as string,
        category: req.query.category as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      // If user is not admin, only show their assigned reviews
      if (user.userType !== 'admin') {
        filters.reviewerId = user.id;
      }

      const reviews = await storage.getModerationReviews(filters);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching moderation reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific moderation review
  app.get("/api/moderation/reviews/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewId = parseInt(req.params.id);
      const review = await storage.getModerationReview(reviewId);

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      // Check if user has access to this review
      if (user.userType !== 'admin' && review.reviewerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(review);
    } catch (error) {
      console.error("Error fetching moderation review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create moderation review
  app.post("/api/moderation/reviews", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewData = {
        ...req.body,
        assignedBy: user.id
      };

      const review = await storage.createModerationReview(reviewData);

      // Log the action
      await storage.createModerationAuditLog({
        reviewId: review.id,
        submissionId: review.submissionId,
        userId: user.id,
        action: 'review_created',
        description: 'Moderation review created',
        metadata: { reviewData }
      });

      // Create notification for assigned reviewer
      if (review.reviewerId) {
        await storage.createModerationNotification({
          recipientId: review.reviewerId,
          senderId: user.id,
          reviewId: review.id,
          type: 'assignment',
          title: 'New Review Assignment',
          message: `You have been assigned a new review for submission #${review.submissionId}`,
          actionUrl: `/moderation/reviews/${review.id}`
        });
      }

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating moderation review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update moderation review
  app.put("/api/moderation/reviews/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewId = parseInt(req.params.id);
      const existingReview = await storage.getModerationReview(reviewId);

      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }

      // Check if user has access to update this review
      if (user.userType !== 'admin' && existingReview.reviewerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData = req.body;
      const updatedReview = await storage.updateModerationReview(reviewId, updateData);

      // Log the action
      await storage.createModerationAuditLog({
        reviewId: reviewId,
        submissionId: existingReview.submissionId,
        userId: user.id,
        action: 'review_updated',
        description: 'Moderation review updated',
        metadata: { changes: updateData }
      });

      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating moderation review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assign review to reviewer
  app.post("/api/moderation/reviews/:id/assign", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewId = parseInt(req.params.id);
      const { reviewerId } = req.body;

      const updatedReview = await storage.assignModerationReview(reviewId, reviewerId, user.id);

      // Log the action
      await storage.createModerationAuditLog({
        reviewId: reviewId,
        submissionId: updatedReview.submissionId,
        userId: user.id,
        action: 'review_assigned',
        description: `Review assigned to user ${reviewerId}`,
        metadata: { reviewerId }
      });

      // Create notification for assigned reviewer
      await storage.createModerationNotification({
        recipientId: reviewerId,
        senderId: user.id,
        reviewId: reviewId,
        type: 'assignment',
        title: 'Review Assignment',
        message: `You have been assigned a review for submission #${updatedReview.submissionId}`,
        actionUrl: `/moderation/reviews/${reviewId}`
      });

      res.json(updatedReview);
    } catch (error) {
      console.error("Error assigning review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get comments for a review
  app.get("/api/moderation/reviews/:id/comments", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewId = parseInt(req.params.id);
      const comments = await storage.getModerationComments(reviewId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching moderation comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add comment to review
  app.post("/api/moderation/reviews/:id/comments", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewId = parseInt(req.params.id);
      const commentData = {
        ...req.body,
        reviewId,
        authorId: user.id
      };

      const comment = await storage.createModerationComment(commentData);

      // Log the action
      await storage.createModerationAuditLog({
        reviewId: reviewId,
        userId: user.id,
        action: 'comment_added',
        description: 'Comment added to review',
        metadata: { commentId: comment.id }
      });

      // Create notifications for mentioned users
      if (comment.mentions && Array.isArray(comment.mentions)) {
        for (const mentionedUserId of comment.mentions) {
          await storage.createModerationNotification({
            recipientId: mentionedUserId,
            senderId: user.id,
            reviewId: reviewId,
            type: 'mention',
            title: 'You were mentioned',
            message: `You were mentioned in a comment on review #${reviewId}`,
            actionUrl: `/moderation/reviews/${reviewId}`
          });
        }
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating moderation comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get available reviewers
  app.get("/api/moderation/reviewers", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const specialization = req.query.specialization as string;
      const reviewers = await storage.getAvailableReviewers(specialization);
      res.json(reviewers);
    } catch (error) {
      console.error("Error fetching available reviewers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get moderation stats
  app.get("/api/moderation/stats", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const reviewerId = req.query.reviewer_id ? parseInt(req.query.reviewer_id as string) : undefined;
      const dateFrom = req.query.date_from ? new Date(req.query.date_from as string) : undefined;
      const dateTo = req.query.date_to ? new Date(req.query.date_to as string) : undefined;

      const stats = await storage.getModerationStats(reviewerId, dateFrom, dateTo);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get moderation notifications
  app.get("/api/moderation/notifications", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || (user.userType !== 'admin' && user.userType !== 'analyst')) {
        return res.status(403).json({ error: "Admin or analyst access required" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getModerationNotifications(user.id, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching moderation notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mark notification as read
  app.put("/api/moderation/notifications/:id/read", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get audit logs
  app.get("/api/moderation/audit", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const reviewId = req.query.review_id ? parseInt(req.query.review_id as string) : undefined;
      const submissionId = req.query.submission_id ? parseInt(req.query.submission_id as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const auditLogs = await storage.getModerationAuditLogs(reviewId, submissionId, limit);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // For demo purposes - in production, use proper admin authentication
      if (email === "admin@cyberhunt.com" && password === "AdminSecure123!") {
        // Create a simple admin token
        const adminToken = Buffer.from(`admin:${Date.now()}`).toString('base64');

        // Store admin session
        req.session.adminUser = { 
          id: 1, 
          email: email, 
          userType: 'admin',
          loginTime: new Date().toISOString()
        };

        res.json({ 
          success: true, 
          token: adminToken, 
          message: "Admin login successful" 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid admin credentials" 
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/verify", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      // Check if admin session exists
      if (req.session.adminUser) {
        res.json({ 
          valid: true, 
          user: req.session.adminUser 
        });
      } else {
        res.status(401).json({ error: "Invalid admin session" });
      }
    } catch (error) {
      console.error("Admin verification error:", error);
      res.status(401).json({ error: "Token verification failed" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      // Clear admin session
      if (req.session.adminUser) {
        delete req.session.adminUser;
      }

      res.json({ success: true, message: "Admin logout successful" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      // Get admin statistics
      const stats = {
        totalUsers: await storage.getUserCount() || 0,
        activePrograms: await storage.getActiveProgramsCount() || 0,
        totalSubmissions: await storage.getSubmissionsCount() || 0,
        pendingReviews: await storage.getPendingReviewsCount() || 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const users = await storage.getAllUsers() || [];

      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified
      }));

      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Cryptocurrency Payment Routes

  // Get crypto network settings
  app.get("/api/crypto/networks", async (req, res) => {
    try {
      const networks = await storage.getCryptoNetworkSettings();
      res.json(networks);
    } catch (error) {
      console.error("Error fetching crypto networks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create Binance Pay order for companies
  app.post("/api/crypto/payment-intent", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const { amount, currency = 'USDT', purpose = 'wallet_topup' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const { CryptoPaymentService } = await import('./crypto-payment-service');
      const result = await CryptoPaymentService.createBinancePayOrder(
        user.id,
        amount,
        currency,
        purpose
      );

      res.json(result);
    } catch (error) {
      console.error("Error creating crypto payment intent:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get company crypto payment history
  app.get("/api/crypto/payments", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const payments = await storage.getCryptoPaymentIntentsByCompany(user.id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching crypto payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add user crypto wallet
  app.post("/api/crypto/wallets", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { walletType, walletAddress, network } = req.body;

      if (!walletType || !walletAddress || !network) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { CryptoPaymentService } = await import('./crypto-payment-service');
      const wallet = await CryptoPaymentService.addUserWallet(req.session.user.id, {
        walletType,
        walletAddress,
        network
      });

      res.status(201).json(wallet);
    } catch (error) {
      console.error("Error adding crypto wallet:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get user crypto wallets
  app.get("/api/crypto/wallets", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { CryptoPaymentService } = await import('./crypto-payment-service');
      const wallets = await CryptoPaymentService.getUserWallets(req.session.user.id);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching crypto wallets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create crypto withdrawal
  app.post("/api/crypto/withdrawals", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { amount, currency, walletAddress, network } = req.body;

      if (!amount || !currency || !walletAddress || !network) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const { CryptoPaymentService } = await import('./crypto-payment-service');
      const withdrawal = await CryptoPaymentService.createCryptoWithdrawal({
        userId: req.session.user.id,
        amount,
        currency,
        walletAddress,
        network
      });

      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Error creating crypto withdrawal:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get user crypto withdrawals
  app.get("/api/crypto/withdrawals", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { CryptoPaymentService } = await import('./crypto-payment-service');
      const withdrawals = await CryptoPaymentService.getCryptoWithdrawals(req.session.user.id);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching crypto withdrawals:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user crypto transactions
  app.get("/api/crypto/transactions", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const transactions = await storage.getCryptoTransactionsByUser(req.session.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching crypto transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Binance Pay webhook
  app.post("/api/crypto/webhooks/binance", async (req, res) => {
    try {
      const signature = req.headers['binancepay-signature'] as string;
      const timestamp = req.headers['binancepay-timestamp'] as string;
      const body = JSON.stringify(req.body);

      const { CryptoPaymentService } = await import('./crypto-payment-service');

      // Verify webhook signature
      const isValid = CryptoPaymentService.verifyWebhookSignature(signature, timestamp, body);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Process webhook
      const result = await CryptoPaymentService.handleBinancePayWebhook(req.body);
      res.json(result);
    } catch (error) {
      console.error("Error handling Binance Pay webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin crypto statistics
  app.get("/api/admin/crypto/stats", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const { CryptoPaymentService } = await import('./crypto-payment-service');
      const stats = await CryptoPaymentService.getCryptoStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching crypto statistics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin crypto withdrawal management
  app.get("/api/admin/crypto/withdrawals", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const status = req.query.status as string;
      const withdrawals = await storage.getAdminCryptoWithdrawals(status);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching admin crypto withdrawals:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/crypto/withdrawals/:id/status", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const withdrawalId = parseInt(req.params.id);
      const { status, notes } = req.body;

      if (!withdrawalId || !status) {
        return res.status(400).json({ error: "Withdrawal ID and status are required" });
      }

      // Get withdrawal details for logging
      const withdrawal = await storage.getCryptoWithdrawalById(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }

      // Update withdrawal status
      const updatedWithdrawal = await storage.updateCryptoWithdrawalStatus(withdrawalId, status, notes);

      // Create audit log
      await storage.createAdminAuditLog({
        adminId: req.session.adminUser.id,
        action: 'crypto_withdrawal_status_update',
        targetType: 'crypto_withdrawal',
        targetId: withdrawalId,
        details: {
          previousStatus: withdrawal.status,
          newStatus: status,
          notes: notes || null,
          withdrawalAmount: withdrawal.amount,
          currency: withdrawal.currency,
          userId: withdrawal.userId
        }
      });

      // If approved, create transaction log
      if (status === 'approved') {
        await storage.createTransaction({
          walletId: withdrawal.walletId || 0,
          type: 'crypto_withdrawal_approved',
          amount: -withdrawal.amount,
          description: `Crypto withdrawal approved: ${(withdrawal.amount / 100).toFixed(2)} ${withdrawal.currency}`,
          status: 'pending_payout'
        });
      }

      // Create notification for user
      await storage.createNotification({
        userId: withdrawal.userId,
        type: 'withdrawal_status_update',
        message: `Your crypto withdrawal request has been ${status}`,
        link: '/crypto/withdrawals'
      });

      res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error updating crypto withdrawal status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Company Crypto Wallet Routes
  app.get("/api/company/wallet", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      let wallet = await storage.getCompanyWallet(user.id);
      if (!wallet) {
        wallet = await storage.createCompanyWallet(user.id);
      }

      res.json(wallet);
    } catch (error) {
      console.error("Error fetching company wallet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/company/transactions", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user || user.userType !== 'company') {
        return res.status(403).json({ error: "Company access required" });
      }

      const transactions = await storage.getCompanyTransactions(user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching company transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to manually update company wallet balance
  app.post("/api/admin/company-wallet/update", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const { companyId, amount, note } = req.body;

      if (!companyId || typeof amount !== 'number') {
        return res.status(400).json({ error: "Company ID and amount are required" });
      }

      // Update company wallet balance
      await storage.updateCompanyWalletBalance(companyId, amount);

      // Create transaction record
      await storage.createCompanyTransaction({
        companyId,
        amount,
        type: 'admin_adjustment',
        note: note || 'Manual balance adjustment by admin'
      });

      res.json({ success: true, message: "Company wallet updated successfully" });
    } catch (error) {
      console.error("Error updating company wallet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin route to get all company wallets
  app.get("/api/admin/company-wallets", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const wallets = await storage.getAllCompanyWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching company wallets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Crypto Payment Approval Admin Routes
  app.get("/api/admin/crypto-payment-approvals", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const pendingApprovals = await storage.getPendingCryptoPaymentApprovals();
      res.json(pendingApprovals);
    } catch (error) {
      console.error("Error fetching crypto payment approvals:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/crypto-payment-approvals/:id/approve", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const { id } = req.params;
      const { adminNotes } = req.body;
      const adminId = req.session.adminUser.id;

      // Get the approval record first
      const approval = await storage.getCryptoPaymentApprovalById(parseInt(id));
      if (!approval) {
        return res.status(404).json({ error: "Approval record not found" });
      }

      // Approve the payment
      const updatedApproval = await storage.approveCryptoPayment(parseInt(id), adminId, adminNotes);
      if (!updatedApproval) {
        return res.status(500).json({ error: "Failed to approve payment" });
      }

      // Update company wallet balance
      const wallet = await storage.getCompanyWallet(approval.companyId);
      if (wallet) {
        await storage.updateCompanyWalletBalance(approval.companyId, approval.amount);
      }

      // Create transaction record
      await storage.createCompanyTransaction({
        companyId: approval.companyId,
        amount: approval.amount,
        type: 'crypto_payment_approved',
        note: `Crypto payment approved by admin: ${approval.amount / 100} ${approval.currency} - Memo: ${approval.paymentMemo}`
      });

      res.json({ success: true, message: "Payment approved successfully" });
    } catch (error) {
      console.error("Error approving crypto payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/crypto-payment-approvals/:id/reject", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const { id } = req.params;
      const { adminNotes } = req.body;
      const adminId = req.session.adminUser.id;

      // Reject the payment
      const updatedApproval = await storage.rejectCryptoPayment(parseInt(id), adminId, adminNotes);
      if (!updatedApproval) {
        return res.status(500).json({ error: "Failed to reject payment" });
      }

      res.json({ success: true, message: "Payment rejected successfully" });
    } catch (error) {
      console.error("Error rejecting crypto payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User verification admin routes
  app.get("/api/admin/company-users", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !req.session.adminUser) {
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const companyUsers = await storage.getCompanyUsers();
      res.json(companyUsers);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/verify-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      console.log('Admin verify-user request:', { userId: req.body.userId, verificationStatus: req.body.verificationStatus });

      if (!token || !req.session.adminUser) {
        console.log('Admin authentication failed');
        return res.status(401).json({ error: "Admin authentication required" });
      }

      const { userId, verificationStatus } = req.body;

      if (!userId || !verificationStatus) {
        return res.status(400).json({ error: "User ID and verification status are required" });
      }

      if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
        return res.status(400).json({ error: "Invalid verification status" });
      }

      const updatedUser = await storage.updateUserVerificationStatus(userId, verificationStatus);
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user verification status" });
      }

      // Create notification for the user
      try {
        await storage.createNotification({
          userId: userId,
          type: 'verification_status_update',
          message: `Your company verification status has been updated to: ${verificationStatus}`,
          link: '/profile'
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Continue even if notification fails
      }

      console.log(`Successfully updated user ${userId} to ${verificationStatus}`);
      res.json({ success: true, message: "User verification status updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user verification status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const server = createServer(app);
  return server;
}