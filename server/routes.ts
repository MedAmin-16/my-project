import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, log } from "./vite";
import { getAdminSessions } from "./index";
import { gradeVulnerability } from "./vulnerability-grading";

export function registerRoutes(app: Express): Server {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vulnerability grading endpoint
  app.post("/api/grade-vulnerability", (req, res) => {
    try {
      const { vulnerabilityType, description, allowsCodeExecution, allowsDataAccess, affectsAdmin } = req.body;
      
      if (!vulnerabilityType || !description) {
        return res.status(400).json({ 
          error: "Missing required fields: vulnerabilityType and description" 
        });
      }

      const grading = gradeVulnerability({
        vulnerabilityType,
        description,
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