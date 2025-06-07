import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { randomBytes } from "crypto";
import { insertSubmissionSchema, insertProgramSchema } from "@shared/schema";
import { getAdminSessions } from "./index";
import { sendWelcomeEmail, sendAchievementEmail, sendSubmissionStatusEmail, sendWithdrawalCompletedEmail } from "./email-service";
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

// Admin credentials (in production, these should be hashed and stored securely)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@cyberhunt.com",
  password: process.env.ADMIN_PASSWORD || "AdminSecure123!"
};

// Import admin sessions from index.ts to share the same storage
let adminSessions: Map<string, { email: string, loginTime: number }>;

// Middleware to check admin authentication
function ensureAdminAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Extract Bearer token
  
  if (!token) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  // Get admin sessions from the module that exports it
  adminSessions = getAdminSessions();
  
  if (!adminSessions.has(token)) {
    return res.status(401).json({ message: "Invalid admin session" });
  }

  const adminSession = adminSessions.get(token);
  if (!adminSession) {
    return res.status(401).json({ message: "Invalid admin session" });
  }

  // Check if session is older than 2 hours
  if (Date.now() - adminSession.loginTime > 2 * 60 * 60 * 1000) {
    adminSessions.delete(token);
    return res.status(401).json({ message: "Admin session expired" });
  }

  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin login route - the official admin login implementation
  app.post("/api/admin/login", (req, res) => {
    console.log('Admin login attempt:', req.body);
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Validate credentials
      if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
        console.log('Invalid credentials provided');
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Get admin sessions from the shared storage
      adminSessions = getAdminSessions();

      // Generate admin token
      const adminToken = randomBytes(32).toString('hex');
      adminSessions.set(adminToken, {
        email,
        loginTime: Date.now()
      });

      console.log('Admin login successful, token created');
      res.json({ 
        message: "Admin login successful",
        token: adminToken,
        success: true
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
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

  // Admin stats endpoint
  app.get("/api/admin/stats", ensureAdminAuthenticated, async (req, res) => {
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
  app.get("/api/admin/users", ensureAdminAuthenticated, async (req, res) => {
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
}

