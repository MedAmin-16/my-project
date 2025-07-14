import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertSubmissionSchema } from "../shared/schema";

// Middleware to ensure a user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Get all bug bounty programs
  app.get("/api/programs", async (req, res, next) => {
    try {
      const programs = await storage.getPublicPrograms();
      res.json(programs);
    } catch (err) {
      next(err);
    }
  });
  
  // Get a specific program
  app.get("/api/programs/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.getProgram(id);
      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }
      res.json(program);
    } catch (err) {
      next(err);
    }
  });
  
  // Get submissions for the authenticated user
  app.get("/api/submissions", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as Express.User).id;
      const submissions = await storage.getSubmissionsByUser(userId);
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  });
  
  // Create a new submission
  app.post("/api/submissions", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as Express.User).id;
      
      // Validate the submission data
      const submissionData = insertSubmissionSchema.parse(req.body);
      
      const submission = await storage.createSubmission({
        ...submissionData,
        userId
      });
      
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      next(err);
    }
  });
  
  // Get activities for the authenticated user
  app.get("/api/activities", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as Express.User).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (err) {
      next(err);
    }
  });
  
  // Get user profile with stats
  app.get("/api/profile", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as Express.User).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const submissions = await storage.getSubmissionsByUser(userId);
      
      // Calculate stats
      const totalSubmissions = submissions.length;
      const acceptedSubmissions = submissions.filter(s => s.status === "accepted").length;
      const rejectedSubmissions = submissions.filter(s => s.status === "rejected").length;
      const pendingSubmissions = submissions.filter(s => s.status === "pending").length;
      const totalRewards = submissions
        .filter(s => s.status === "accepted" && s.reward !== null)
        .reduce((sum, s) => sum + (s.reward || 0), 0);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        stats: {
          totalSubmissions,
          acceptedSubmissions,
          rejectedSubmissions,
          pendingSubmissions,
          totalRewards
        }
      });
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}