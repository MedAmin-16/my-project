import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, log } from "./vite";
import { getAdminSessions } from "./index";
import { gradeVulnerability } from "./vulnerability-grading";

export function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vulnerability grading endpoint
  app.post("/api/grade-vulnerability", (req, res) => {
    try {
      const { vulnerabilityType, impactTarget, allowsCodeExecution, allowsDataAccess } = req.body;
      
      if (!vulnerabilityType || !impactTarget) {
        return res.status(400).json({ 
          error: "Missing required fields: vulnerabilityType and impactTarget" 
        });
      }

      const grading = gradeVulnerability({
        vulnerabilityType,
        impactTarget,
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

  return setupVite(app, server).then(() => server);
}
```