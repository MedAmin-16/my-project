import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { randomBytes } from "crypto";
import { insertSubmissionSchema, insertProgramSchema } from "@shared/schema";
import { getAdminSessions } from "./index";
import { sendWelcomeEmail, sendAchievementEmail, sendSubmissionStatusEmail, sendWithdrawalCompletedEmail } from "./email-service";
import { PaymentService } from "./payment-service";
import multer from "multer";
import path from "path";
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Middleware to check if user is a company
function ensureCompanyUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user?.userType !== "company") {
    return res.status(403).json({ message: "Access denied. Company account required." });
  }

  next();
}

// Middleware to check if user is an admin
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  // Check authentication and role
  if (!req.isAuthenticated() || req.user?.role !== "admin") {
    console.warn(`Unauthorized admin access attempt from IP ${req.ip}`);
    return res.status(403).json({ message: "Access denied." });
  }

  // Check if session is fresh (less than 1 hour old)
  const sessionAge = req.session?.cookie?.maxAge || 0;
  if (sessionAge > 3600000) { // 1 hour in milliseconds
    return res.status(401).json({ message: "Session expired. Please login again." });
  }

  // Rate limiting for admin endpoints
  const ipAddress = req.ip;
  const currentTime = Date.now();
  const requestLog = adminRequestLog.get(ipAddress) || [];
  const recentRequests = requestLog.filter(time => currentTime - time < 60000); // Last minute

  if (recentRequests.length > 30) { // Max 30 requests per minute
    console.warn(`Rate limit exceeded for admin access from IP ${ipAddress}`);
    return res.status(429).json({ message: "Too many requests" });
  }

  adminRequestLog.set(ipAddress, [...recentRequests, currentTime]);
  next();
}

// Track admin endpoint requests for rate limiting
const adminRequestLog = new Map<string, number[]>();

import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

// Secure admin credentials with bcrypt hashing
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@cyberhunt.com",
  // In production, this should be a pre-hashed password
  passwordHash: process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || "AdminSecure123!", 12)
};

// Admin-specific rate limiting
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 attempts per IP
  skipSuccessfulRequests: true,
  message: { message: "Too many admin login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for admin APIs
  message: { message: "Admin API rate limit exceeded" }
});

// Enhanced admin session storage with additional security metadata
interface AdminSession {
  email: string;
  loginTime: number;
  ipAddress: string;
  userAgent: string;
  lastActivity: number;
}

// Import admin sessions from index.ts to share the same storage
let adminSessions: Map<string, AdminSession>;

// Enhanced admin authentication middleware with comprehensive security
function ensureAdminAuthenticated(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const authHeader = req.headers.authorization;
  
  // Check for proper Authorization header format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`Admin access denied: Missing/invalid auth header from IP ${clientIP} at ${new Date().toISOString()}`);
    return res.status(401).json({ message: "Admin authentication required" });
  }

  const token = authHeader.split(' ')[1];
  
  // Validate token format (should be 64 hex characters)
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    console.warn(`Invalid admin token format from IP ${clientIP} at ${new Date().toISOString()}`);
    return res.status(401).json({ message: "Invalid session format" });
  }

  // Get admin sessions from the module that exports it
  adminSessions = getAdminSessions();
  
  if (!adminSessions.has(token)) {
    console.warn(`Admin session not found for token from IP ${clientIP} at ${new Date().toISOString()}`);
    return res.status(401).json({ message: "Invalid admin session" });
  }

  const adminSession = adminSessions.get(token)!;

  // Check session expiration (2 hours)
  const sessionAge = Date.now() - adminSession.loginTime;
  if (sessionAge > 2 * 60 * 60 * 1000) {
    adminSessions.delete(token);
    console.warn(`Admin session expired for ${adminSession.email} from IP ${clientIP}`);
    return res.status(401).json({ message: "Admin session expired" });
  }

  // Check for session inactivity (30 minutes)
  const inactivityTime = Date.now() - adminSession.lastActivity;
  if (inactivityTime > 30 * 60 * 1000) {
    adminSessions.delete(token);
    console.warn(`Admin session inactive for ${adminSession.email} from IP ${clientIP}`);
    return res.status(401).json({ message: "Session expired due to inactivity" });
  }

  // Verify IP address consistency (optional but recommended)
  if (adminSession.ipAddress !== clientIP) {
    console.warn(`Admin IP mismatch: Session IP ${adminSession.ipAddress}, Request IP ${clientIP} for ${adminSession.email}`);
    // Uncomment to enforce IP consistency:
    // adminSessions.delete(token);
    // return res.status(401).json({ message: "Session security violation" });
  }

  // Update last activity
  adminSession.lastActivity = Date.now();
  adminSessions.set(token, adminSession);

  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin login route with comprehensive security
  app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    console.log(`Admin login attempt from IP: ${clientIP}, User-Agent: ${userAgent.substring(0, 100)}`);
    
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        console.warn(`Admin login failed: Missing credentials from IP ${clientIP}`);
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.warn(`Admin login failed: Invalid email format from IP ${clientIP}`);
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate credentials with timing-safe comparison
      const emailMatch = email === ADMIN_CREDENTIALS.email;
      const passwordMatch = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);

      if (!emailMatch || !passwordMatch) {
        console.warn(`Admin login failed: Invalid credentials for ${email} from IP ${clientIP}`);
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Check for existing sessions and invalidate old ones
      adminSessions = getAdminSessions();
      const existingSessions = Array.from(adminSessions.entries()).filter(
        ([, session]) => session.email === email
      );
      
      // Clean up old sessions (only allow one active session per admin)
      existingSessions.forEach(([token]) => {
        adminSessions.delete(token);
      });

      // Generate secure admin token
      const adminToken = randomBytes(32).toString('hex');
      
      // Store session with security metadata
      adminSessions.set(adminToken, {
        email,
        loginTime: Date.now(),
        ipAddress: clientIP,
        userAgent,
        lastActivity: Date.now()
      });

      console.log(`Admin login successful for ${email} from IP ${clientIP}`);
      
      // Set secure headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      res.json({ 
        message: "Admin login successful",
        token: adminToken,
        success: true,
        expiresIn: 7200 // 2 hours
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin verify endpoint with rate limiting
  app.get("/api/admin/verify", adminApiLimiter, ensureAdminAuthenticated, (req, res) => {
    res.json({ message: "Admin authenticated", success: true });
  });

  // Admin logout endpoint with secure cleanup
  app.post("/api/admin/logout", adminApiLimiter, ensureAdminAuthenticated, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (token) {
      adminSessions = getAdminSessions();
      const session = adminSessions.get(token);
      adminSessions.delete(token);
      
      if (session) {
        console.log(`Admin logout: ${session.email} from IP ${req.ip}`);
      }
    }
    
    res.json({ message: "Logged out successfully" });
  });

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


// AI Report Enhancement endpoint
app.post('/api/enhance-report', async (req, res) => {
  try {
    const report = req.body;

    // Enhance report structure and content
    const enhancedReport = {
      ...report,
      title: report.title.charAt(0).toUpperCase() + report.title.slice(1),
      description: formatDescription(report.description, report.type),
      severity: suggestSeverity(report.description, report.type)
    };

    res.json(enhancedReport);
  } catch (error) {
    res.status(500).json({ message: 'Failed to enhance report' });
  }
});

function formatDescription(description: string, type: string): string {
  const sections = [
    '## Steps to Reproduce',
    '## Impact',
    '## Affected Components',
    '## Suggestions for Remediation'
  ];

  let formatted = description;

  // Add missing sections if they don't exist
  sections.forEach(section => {
    if (!description.includes(section)) {
      formatted += `\n\n${section}\n`;
    }
  });

  return formatted;
}

function suggestSeverity(description: string, type: string): string {
  // Basic severity suggestion logic
  const criticalPatterns = ['remote code execution', 'unauthorized access', 'data breach'];
  const highPatterns = ['sql injection', 'xss', 'authentication bypass'];

  description = description.toLowerCase();

  if (criticalPatterns.some(pattern => description.includes(pattern))) {
    return 'Critical';
  } else if (highPatterns.some(pattern => description.includes(pattern))) {
    return 'High';
  }

  return 'Medium';
}

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

  // =======================================================
  // COMPANY-SPECIFIC ENDPOINTS
  // =======================================================

  // Get all programs created by the company
  app.get("/api/company/programs", ensureCompanyUser, async (req, res) => {
    try {
      // This is a simplified implementation since we don't have company-specific program filtering yet
      // In a real implementation, we would filter programs by company owner ID
      const programs = await storage.getAllPrograms();

      // Filter programs to simulate those created by this company
      // In a production app, this would be done via a database query
      const companyPrograms = programs.filter(program =>
        program.company === req.user?.companyName ||
        program.company === req.user?.username
      );

      res.json(companyPrograms);
    } catch (error) {
      console.error('Error fetching company programs:', error);
      res.status(500).json({ message: "Failed to fetch company programs" });
    }
  });

  // Get all submissions for the company's programs
  app.get("/api/company/submissions", ensureCompanyUser, async (req, res) => {
    try {
      // First get the company's programs
      const programs = await storage.getAllPrograms();

      // Filter programs to those created by this company
      const companyPrograms = programs.filter(program =>
        program.company === req.user?.companyName ||
        program.company === req.user?.username
      );

      // Extract program IDs
      const programIds = companyPrograms.map(program => program.id);

      // Now get all submissions for each program and flatten the array
      const submissionsPromises = programIds.map(programId =>
        storage.getSubmissionsByProgram(programId)
      );

      const allSubmissions = await Promise.all(submissionsPromises);
      const flattenedSubmissions = allSubmissions.flat();

      // Add username to each submission by looking up the user
      const submissionsWithUsername = await Promise.all(
        flattenedSubmissions.map(async (submission) => {
          const user = await storage.getUser(submission.userId);
          return {
            ...submission,
            username: user?.username || "Anonymous"
          };
        })
      );

      res.json(submissionsWithUsername);
    } catch (error) {
      console.error('Error fetching company submissions:', error);
      res.status(500).json({ message: "Failed to fetch company submissions" });
    }
  });

  // Create a new program as a company
  app.post("/api/company/programs", ensureCompanyUser, async (req, res) => {
    try {
      // Parse and validate input
      const programData = insertProgramSchema.parse(req.body);

      // Set the company name automatically to the current user's company name
      const companyName = req.user?.companyName || req.user?.username || "Unknown Company";
      const programWithCompany = {
        ...programData,
        company: companyName
      };

      // Create program
      const program = await storage.createProgram(programWithCompany);

      // Create activity
      if (req.user) {
        await storage.createActivity({
          userId: req.user.id,
          type: 'program_created',
          message: `Created new bug bounty program: ${program.name}`,
          details: `Program ID: ${program.id}`,
          relatedId: program.id
        });
      }

      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      console.error('Error creating company program:', error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  // Update submission status (approve/reject)
  app.patch("/api/company/submissions/:id/status", ensureCompanyUser, async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { status, reward, message } = req.body;

      if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved', 'rejected', or 'pending'" });
      }

      // Update submission status
      const updatedSubmission = await storage.updateSubmissionStatus(submissionId, status, reward);

      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Get the submission author
      const submissionUser = await storage.getUser(updatedSubmission.userId);

      // Send email notification to user
      if (submissionUser) {
        await sendSubmissionStatusEmail(updatedSubmission, message || '');

        // Create notification for the user
        await storage.createNotification({
          type: 'submission_update',
          message: `Your submission "${updatedSubmission.title}" has been ${status}${status === 'approved' && reward ? ` with a reward of $${reward}` : ''}`,
          userId: submissionUser.id,
          relatedId: submissionId
        });

        // If approved, award reputation points
        if (status === 'approved') {
          const reputationPoints = reward ? Math.min(Math.floor(reward / 10), 100) : 20;
          const currentReputation = submissionUser.reputation || 0;
          await storage.updateUserReputation(submissionUser.id, currentReputation + reputationPoints);

          // Handle bounty payout
          if (reward) {
            const wallet = await storage.getWalletByUserId(submissionUser.id);
            if (wallet) {
              // Create bounty transaction
              await storage.createTransaction({
                walletId: wallet.id,
                type: 'bounty',
                amount: reward,
                description: `Bounty for submission: ${updatedSubmission.title}`,
                submissionId: submissionId
              });

              // Update wallet balance
              await storage.updateWalletBalance(wallet.id, wallet.balance + reward);
            }
          }
        }
      }

      res.json(updatedSubmission);
    } catch (error) {
      console.error('Error updating submission status:', error);
      res.status(500).json({ message: "Failed to update submission status" });
    }
  });

  // Company wallet endpoints
  app.get("/api/company/wallet", ensureCompanyUser, async (req, res) => {
    try {
      const companyId = req.user!.id;
      let wallet = await storage.getCompanyWallet(companyId);
      
      if (!wallet) {
        wallet = await storage.createCompanyWallet(companyId);
      }
      
      res.json(wallet);
    } catch (error) {
      console.error('Error fetching company wallet:', error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get("/api/company/transactions", ensureCompanyUser, async (req, res) => {
    try {
      const companyId = req.user!.id;
      const transactions = await storage.getCompanyTransactions(companyId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching company transactions:', error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/user", ensureAuthenticated, async (req, res) => {
    res.json(req.user);
  });

  // Photo upload endpoint
  app.post("/api/user/photo", ensureAuthenticated, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await storage.updateUserPhoto(req.user!.id, photoUrl);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ photoUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });





  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      
      if (token) {
        // Get admin sessions from the shared storage
        const sessions = getAdminSessions();
        sessions.delete(token);
      }
      
      res.json({ message: "Admin logout successful" });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Admin session verification endpoint
  app.get("/api/admin/verify", ensureAdminAuthenticated, (req, res) => {
    res.json({ message: "Admin session valid" });
  });

  // Admin stats endpoint with security
  app.get("/api/admin/stats", adminApiLimiter, ensureAdminAuthenticated, async (req, res) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    try {
      // Use storage methods instead of direct db access
      const programs = await storage.getAllPrograms();
      
      // Get basic stats without requiring user data for now
      const stats = {
        totalUsers: 0, // Will be implemented when user storage is available
        activePrograms: programs ? programs.filter(p => p.status === 'active').length : 0,
        totalSubmissions: 0, // Will be implemented when submission data is available
        pendingReviews: 0
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(200).json({
        totalUsers: 0,
        activePrograms: 0,
        totalSubmissions: 0,
        pendingReviews: 0
      });
    }
  });

  // Admin users endpoint
  app.get("/api/admin/users", adminApiLimiter, ensureAdminAuthenticated, async (req, res) => {
    try {
      // Return empty array for now - user management can be implemented later
      res.json([]);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.json([]);
    }
  });

  // Admin company wallet endpoints
  app.get("/api/admin/company-wallets", ensureAdminAuthenticated, async (req, res) => {
    try {
      const companyWallets = await storage.getAllCompanyWallets();
      res.json(companyWallets);
    } catch (error) {
      console.error('Error fetching company wallets:', error);
      res.status(500).json({ message: "Failed to fetch company wallets" });
    }
  });

  app.get("/api/admin/companies", ensureAdminAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/admin/add-payment", ensureAdminAuthenticated, async (req, res) => {
    try {
      const { companyId, amount, note } = req.body;

      if (!companyId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Company ID and positive amount are required" });
      }

      // Update company wallet balance
      await storage.updateCompanyWalletBalance(companyId, amount);

      // Create transaction record
      await storage.createCompanyTransaction({
        companyId,
        amount,
        type: 'manual',
        note: note || 'Manual payment added by admin'
      });

      res.json({ message: "Payment added successfully" });
    } catch (error) {
      console.error('Error adding payment:', error);
      res.status(500).json({ message: "Failed to add payment" });
    }
  });



  app.post("/api/logout", (req, res) => {
    try {
      req.logout(() => {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: "Logout failed" });
          }

          // Clear all session-related cookies
          res.clearCookie('connect.sid', { path: '/' });
          res.clearCookie('XSRF-TOKEN', { path: '/' });
          res.clearCookie('_csrf', { path: '/' });

          // Ensure proper headers for CORS if needed
          res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

          return res.status(200).json({ message: "Logged out successfully" });
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: "Logout failed" });
    }
  });


  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Wallet routes function
export async function registerWalletRoutes(app: Express): Promise<void> {
  // Get user wallet
  app.get("/api/wallet", ensureAuthenticated, async (req, res) => {
    const wallet = await storage.getWalletByUserId(req.user!.id);
    if (!wallet) {
      const newWallet = await storage.createWallet(req.user!.id);
      return res.json(newWallet);
    }
    return res.json(wallet);
  });

  // Create withdrawal request
  app.post("/api/withdrawals", ensureAuthenticated, async (req, res) => {
    const { amount, method, destination, notes } = req.body;

    const wallet = await storage.getWalletByUserId(req.user!.id);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const withdrawal = await storage.createWithdrawal({
      walletId: wallet.id,
      amount,
      method,
      destination,
      notes
    });

    return res.status(201).json(withdrawal);
  });

  // Get user withdrawals
  app.get("/api/withdrawals", ensureAuthenticated, async (req, res) => {
    const withdrawals = await storage.getUserWithdrawals(req.user!.id);
    return res.json(withdrawals);
  });

  // Admin endpoint to update withdrawal status
  app.patch("/api/admin/withdrawals/:id/status", ensureAdminAuthenticated, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { status, notes } = req.body;

      if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'pending', 'approved', 'rejected', or 'completed'" });
      }

      // Update withdrawal status
      const updatedWithdrawal = await storage.updateWithdrawalStatus(withdrawalId, status, notes);

      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      // If status is completed, send confirmation email automatically
      if (status === 'completed') {
        const success = await sendWithdrawalCompletedEmail(updatedWithdrawal);
        if (success) {
          console.log(`Withdrawal completion email sent for withdrawal ID: ${withdrawalId}`);
        } else {
          console.error(`Failed to send withdrawal completion email for withdrawal ID: ${withdrawalId}`);
        }
      }

      res.json(updatedWithdrawal);
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      res.status(500).json({ message: "Failed to update withdrawal status" });
    }
  });

  // Get all withdrawals for admin
  app.get("/api/admin/withdrawals", ensureAdminAuthenticated, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // =======================================================
  // PAYMENT SYSTEM ENDPOINTS
  // =======================================================

  // Get payment methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // Create payment intent for company deposits
  app.post("/api/payments/create-intent", ensureCompanyUser, async (req, res) => {
    try {
      const { amount, currency = 'USD', purpose = 'wallet_topup' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (amount > 10000000) { // $100,000 limit
        return res.status(400).json({ message: "Amount exceeds maximum limit" });
      }

      const result = await PaymentService.createPaymentIntent(
        req.user!.id,
        amount,
        currency,
        purpose
      );

      res.json(result);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      if (error.message.includes('Rate limit')) {
        return res.status(429).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Confirm payment completion
  app.post("/api/payments/confirm", ensureCompanyUser, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      const paymentIntent = await PaymentService.confirmPayment(paymentIntentId);
      res.json({ message: "Payment confirmed successfully", paymentIntent });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Webhook for Stripe events
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      
      // In production, verify the webhook signature
      // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      
      // For demo purposes, we'll process the event directly
      await PaymentService.handleStripeWebhook(req.body);
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // Create escrow for approved bounties
  app.post("/api/escrow/create", ensureCompanyUser, async (req, res) => {
    try {
      const { submissionId, bountyAmount } = req.body;

      if (!submissionId || !bountyAmount || bountyAmount <= 0) {
        return res.status(400).json({ message: "Valid submission ID and bounty amount are required" });
      }

      // Verify submission belongs to a program owned by this company
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const program = await storage.getProgram(submission.programId);
      if (!program || (program.company !== req.user?.companyName && program.company !== req.user?.username)) {
        return res.status(403).json({ message: "Not authorized for this submission" });
      }

      const escrow = await PaymentService.createEscrowForBounty(
        submissionId,
        bountyAmount,
        req.user!.id
      );

      // Update submission status to approved with reward
      await storage.updateSubmissionStatus(submissionId, 'approved', bountyAmount);

      res.json({ message: "Escrow created successfully", escrow });
    } catch (error) {
      console.error('Error creating escrow:', error);
      if (error.message.includes('Insufficient')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create escrow" });
    }
  });

  // Request payout (for researchers)
  app.post("/api/payouts/request", ensureAuthenticated, async (req, res) => {
    try {
      const { submissionId, paymentMethodId, paymentDetails } = req.body;

      if (!submissionId || !paymentMethodId || !paymentDetails) {
        return res.status(400).json({ message: "Submission ID, payment method, and payment details are required" });
      }

      // Verify submission belongs to the user
      const submission = await storage.getSubmission(submissionId);
      if (!submission || submission.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized for this submission" });
      }

      // Check if submission is approved and has escrow
      if (submission.status !== 'approved') {
        return res.status(400).json({ message: "Submission must be approved before requesting payout" });
      }

      const escrow = await storage.getEscrowBySubmission(submissionId);
      if (!escrow || escrow.status !== 'held') {
        return res.status(400).json({ message: "No valid escrow found for this submission" });
      }

      // Fraud detection
      const fraudCheck = await PaymentService.detectFraud(
        req.user!.id,
        escrow.researcherPayout,
        req.ip
      );

      if (fraudCheck.isFraudulent) {
        return res.status(403).json({ message: `Payout blocked: ${fraudCheck.reason}` });
      }

      const payout = await PaymentService.releaseEscrowAndPayout(
        submissionId,
        paymentMethodId,
        paymentDetails
      );

      res.json({ message: "Payout requested successfully", payout });
    } catch (error) {
      console.error('Error requesting payout:', error);
      res.status(500).json({ message: "Failed to request payout" });
    }
  });

  // Get user payouts
  app.get("/api/payouts", ensureAuthenticated, async (req, res) => {
    try {
      const payouts = await storage.getUserPayouts(req.user!.id);
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Create payment dispute
  app.post("/api/disputes", ensureAuthenticated, async (req, res) => {
    try {
      const { submissionId, disputeType, description } = req.body;

      if (!submissionId || !disputeType || !description) {
        return res.status(400).json({ message: "Submission ID, dispute type, and description are required" });
      }

      // Verify user is related to the submission
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Check if user is either the researcher or from the company
      const program = await storage.getProgram(submission.programId);
      const isResearcher = submission.userId === req.user!.id;
      const isCompanyUser = req.user?.userType === 'company' && 
        (program?.company === req.user?.companyName || program?.company === req.user?.username);

      if (!isResearcher && !isCompanyUser) {
        return res.status(403).json({ message: "Not authorized to dispute this submission" });
      }

      const dispute = await storage.createPaymentDispute({
        submissionId,
        disputedBy: req.user!.id,
        disputeType,
        description
      });

      res.json({ message: "Dispute created successfully", dispute });
    } catch (error) {
      console.error('Error creating dispute:', error);
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  // Admin: Get all payment disputes
  app.get("/api/admin/disputes", ensureAdminAuthenticated, async (req, res) => {
    try {
      const disputes = await storage.getAllPaymentDisputes();
      res.json(disputes);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  // Admin: Resolve payment dispute
  app.patch("/api/admin/disputes/:id", ensureAdminAuthenticated, async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const { status, resolution } = req.body;

      if (!status || !['resolved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Valid status is required (resolved or rejected)" });
      }

      const dispute = await storage.updatePaymentDispute(
        disputeId,
        status,
        resolution,
        req.user!.id
      );

      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }

      res.json({ message: "Dispute updated successfully", dispute });
    } catch (error) {
      console.error('Error updating dispute:', error);
      res.status(500).json({ message: "Failed to update dispute" });
    }
  });

  // Admin: Get payment analytics
  app.get("/api/admin/payment-analytics", ensureAdminAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await storage.getPaymentAnalytics(start, end);
      const commissions = await storage.getTotalCommissions(start, end);

      res.json({
        ...analytics,
        commissions
      });
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      res.status(500).json({ message: "Failed to fetch payment analytics" });
    }
  });

  // Admin: Get all payouts
  app.get("/api/admin/payouts", ensureAdminAuthenticated, async (req, res) => {
    try {
      // This would need a new storage method to get all payouts for admin
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error('Error fetching admin payouts:', error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Admin: Create payment method
  app.post("/api/admin/payment-methods", ensureAdminAuthenticated, async (req, res) => {
    try {
      const { name, type, supportedCurrencies, processingFee } = req.body;

      if (!name || !type || !supportedCurrencies) {
        return res.status(400).json({ message: "Name, type, and supported currencies are required" });
      }

      const paymentMethod = await storage.createPaymentMethod({
        name,
        type,
        supportedCurrencies,
        processingFee: processingFee || 0
      });

      res.json({ message: "Payment method created successfully", paymentMethod });
    } catch (error) {
      console.error('Error creating payment method:', error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });
}

