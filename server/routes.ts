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

  const server = createServer(app);
  return server;
}