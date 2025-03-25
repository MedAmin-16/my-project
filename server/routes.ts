import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertSubmissionSchema, insertProgramSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/login, /api/register, etc.)
  setupAuth(app);

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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
