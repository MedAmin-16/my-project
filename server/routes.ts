import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertSubmissionSchema, insertProgramSchema } from "@shared/schema";
import { sendWelcomeEmail, sendAchievementEmail, sendSubmissionStatusEmail } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/login, /api/register, etc.)
  setupAuth(app);
  
  // Get leaderboard (top users by reputation)
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getLeaderboard();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get all public programs
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getPublicPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Get a specific program
  app.get("/api/programs/:id", async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const program = await storage.getProgram(programId);
      
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  // Create a new program (would require admin authentication in production)
  app.post("/api/programs", async (req, res) => {
    try {
      // Parse and validate input
      const programData = insertProgramSchema.parse(req.body);
      
      // Create program
      const program = await storage.createProgram(programData);
      
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  // Get submissions for current user
  app.get("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user.id;
      const submissions = await storage.getSubmissionsByUser(userId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Create a new bug submission
  app.post("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // Parse and validate input
      const submissionData = insertSubmissionSchema.parse(req.body);
      
      // Check if program exists
      const program = await storage.getProgram(submissionData.programId);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      // Create submission
      const submission = await storage.createSubmission({
        ...submissionData,
        userId: req.user.id
      });
      
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Get user's recent activities
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  
  // Get user's notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  
  // Send welcome email after verification
  app.post("/api/send-welcome-email", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const success = await sendWelcomeEmail(req.user.id);
      
      if (success) {
        // Create welcome notification
        await storage.createNotification({
          type: 'system',
          message: 'Welcome to CyberHunt! Your account has been verified.',
          link: '/dashboard',
          userId: req.user.id,
          relatedId: null
        });
        
        res.status(200).json({ message: "Welcome email sent successfully" });
      } else {
        res.status(400).json({ message: "Failed to send welcome email. Please verify your email first." });
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      res.status(500).json({ message: "An error occurred while sending welcome email" });
    }
  });
  
  // Award an achievement to user (could be triggered by various milestones)
  app.post("/api/award-achievement", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { title, description, reputationPoints } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }
      
      // Update user reputation if points provided
      if (reputationPoints && typeof reputationPoints === 'number') {
        // Get current reputation
        const user = await storage.getUser(req.user.id);
        if (user) {
          // Use current reputation or default to 0 if null
          const currentReputation = user.reputation || 0;
          const newReputation = currentReputation + reputationPoints;
          await storage.updateUserReputation(req.user.id, newReputation);
        }
      }
      
      // Send achievement email
      const success = await sendAchievementEmail(req.user.id, title, description);
      
      if (success) {
        res.status(200).json({ message: "Achievement awarded successfully" });
      } else {
        res.status(400).json({ message: "Failed to award achievement" });
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
      res.status(500).json({ message: "An error occurred while awarding achievement" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
