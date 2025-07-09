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

  // Admin authentication endpoints
  const adminSessions = getAdminSessions();

  app.post("/api/admin/login", (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Hard-coded admin credentials for demo
      const adminEmail = "admin@cyberhunt.com";
      const adminPassword = "AdminSecure123!";

      if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate a simple token
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session
      adminSessions.set(token, {
        email: adminEmail,
        loginTime: Date.now()
      });

      res.json({
        message: "Login successful",
        token: token,
        user: { email: adminEmail, role: "admin" }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/verify", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const session = adminSessions.get(token);
      const now = Date.now();
      const sessionAge = now - session!.loginTime;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        adminSessions.delete(token);
        return res.status(401).json({ message: "Session expired" });
      }

      res.json({ 
        message: "Valid session",
        user: { email: session!.email, role: "admin" }
      });
    } catch (error) {
      console.error("Admin verify error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (token) {
        adminSessions.delete(token);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock admin stats
      res.json({
        totalUsers: 1250,
        totalPrograms: 45,
        totalSubmissions: 892,
        totalEarnings: 125000,
        pendingReviews: 23,
        activePrograms: 38
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/users", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Mock users data
      res.json([]);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment System Routes
  
  // Get comments for a submission
  app.get("/api/submissions/:submissionId/comments", (req, res) => {
    try {
      const { submissionId } = req.params;
      
      if (!submissionId || isNaN(Number(submissionId))) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      // Mock comments data with nested structure
      const mockComments = [
        {
          id: 1,
          content: "Thanks for the report! We're reviewing this vulnerability.",
          submissionId: Number(submissionId),
          userId: 2,
          parentId: null,
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: 2,
            username: "security-team",
            userType: "company"
          },
          replies: [
            {
              id: 3,
              content: "Looking forward to your feedback!",
              submissionId: Number(submissionId),
              userId: 1,
              parentId: 1,
              isEdited: false,
              editedAt: null,
              createdAt: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
              updatedAt: new Date(Date.now() - 82800000).toISOString(),
              user: {
                id: 1,
                username: "researcher123",
                userType: "hacker"
              },
              replies: []
            }
          ]
        },
        {
          id: 2,
          content: "I've attached additional proof-of-concept code that demonstrates the severity of this issue.",
          submissionId: Number(submissionId),
          userId: 1,
          parentId: null,
          isEdited: true,
          editedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          createdAt: new Date(Date.now() - 50400000).toISOString(), // 14 hours ago
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          user: {
            id: 1,
            username: "researcher123",
            userType: "hacker"
          },
          replies: []
        }
      ];

      res.json(mockComments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add a new comment
  app.post("/api/submissions/:submissionId/comments", (req, res) => {
    try {
      const { submissionId } = req.params;
      const { content, parentId } = req.body;

      if (!submissionId || isNaN(Number(submissionId))) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ message: "Comment too long" });
      }

      // Mock user (in real app, get from auth middleware)
      const mockUser = {
        id: 1,
        username: "researcher123",
        userType: "hacker"
      };

      // Create new comment
      const newComment = {
        id: Date.now(), // Mock ID
        content: content.trim(),
        submissionId: Number(submissionId),
        userId: mockUser.id,
        parentId: parentId || null,
        isEdited: false,
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
        replies: []
      };

      // In real app: save to database, send notifications, etc.
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a comment
  app.put("/api/comments/:commentId", (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      if (!commentId || isNaN(Number(commentId))) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ message: "Comment too long" });
      }

      // Mock updated comment
      const updatedComment = {
        id: Number(commentId),
        content: content.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(updatedComment);
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a comment
  app.delete("/api/comments/:commentId", (req, res) => {
    try {
      const { commentId } = req.params;

      if (!commentId || isNaN(Number(commentId))) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      // In real app: check ownership, mark as deleted, etc.
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark comments as read for a submission
  app.post("/api/submissions/:submissionId/comments/mark-read", (req, res) => {
    try {
      const { submissionId } = req.params;

      if (!submissionId || isNaN(Number(submissionId))) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      // In real app: update last_read_at for user

      res.json({ message: "Comments marked as read" });
    } catch (error) {
      console.error("Mark comments read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public Chat Routes
  
  // Get public chat messages
  app.get("/api/public-chat/messages", (req, res) => {
    try {
      const { limit = "50", before } = req.query;
      
      const limitNum = Math.min(Number(limit) || 50, 100); // Max 100 messages

      // Mock messages data
      const mockMessages = [
        {
          id: 1,
          content: "🚀 Excited to announce our new Web Application Security Program! Higher rewards for critical vulnerabilities.",
          userId: 10,
          messageType: "announcement",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          user: {
            id: 10,
            username: "TechCorpSecurity",
            userType: "company"
          }
        },
        {
          id: 2,
          content: "Has anyone tested the new authentication flows? Looking for collaboration on some findings.",
          userId: 5,
          messageType: "message",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: 5,
            username: "SecurityResearcher42",
            userType: "hacker"
          }
        },
        {
          id: 3,
          content: "Great job to everyone who participated in last month's contest! Looking forward to the next one.",
          userId: 8,
          messageType: "message",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          updatedAt: new Date(Date.now() - 900000).toISOString(),
          user: {
            id: 8,
            username: "EliteHunter",
            userType: "hacker"
          }
        },
        {
          id: 4,
          content: "📢 New bounty program launching next week - Mobile App Security. Stay tuned for details!",
          userId: 12,
          messageType: "announcement",
          isEdited: false,
          editedAt: null,
          createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          updatedAt: new Date(Date.now() - 300000).toISOString(),
          user: {
            id: 12,
            username: "StartupCorp",
            userType: "company"
          }
        }
      ];

      // Sort by creation date (newest first for display, but return in chronological order)
      const sortedMessages = mockMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      res.json(sortedMessages.slice(-limitNum));
    } catch (error) {
      console.error("Get public messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Post a new public message
  app.post("/api/public-chat/messages", (req, res) => {
    try {
      const { content, messageType = "message" } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: "Message too long" });
      }

      // Mock user (in real app, get from auth middleware)
      const mockUser = {
        id: 1,
        username: "researcher123",
        userType: "hacker"
      };

      // Validate message type
      if (!["message", "announcement"].includes(messageType)) {
        return res.status(400).json({ message: "Invalid message type" });
      }

      // Only companies can post announcements
      if (messageType === "announcement" && mockUser.userType !== "company") {
        return res.status(403).json({ message: "Only companies can post announcements" });
      }

      // Create new message
      const newMessage = {
        id: Date.now(), // Mock ID
        content: content.trim(),
        userId: mockUser.id,
        messageType,
        isEdited: false,
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser
      };

      // In real app: save to database, broadcast to connected clients, etc.
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Post public message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a public message
  app.put("/api/public-chat/messages/:messageId", (req, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      if (!messageId || isNaN(Number(messageId))) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: "Message too long" });
      }

      // Mock updated message
      const updatedMessage = {
        id: Number(messageId),
        content: content.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(updatedMessage);
    } catch (error) {
      console.error("Update public message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a public message
  app.delete("/api/public-chat/messages/:messageId", (req, res) => {
    try {
      const { messageId } = req.params;

      if (!messageId || isNaN(Number(messageId))) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      // In real app: check ownership, mark as deleted, etc.
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete public message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const server = createServer(app);
  return server;
}