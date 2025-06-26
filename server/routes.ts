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

  const server = createServer(app);
  return server;
}