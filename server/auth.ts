import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { scrypt, timingSafeEqual, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendVerificationEmail, verifyEmailWithToken, sendWelcomeEmail } from "./email-service";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" }
});

// Apply rate limit to all API routes
app.use('/api/', apiLimiter);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, userType, companyName, companyWebsite, companySize, companyIndustry } = req.body;

      if (!username || !password || !email) {
        return res.status(400).json({ message: "Username, password, and email are required" });
      }

      // Check if username is taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email is taken
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(password);

      // Create the user with appropriate user type
      const userData = {
        username,
        password: hashedPassword,
        email,
        userType: userType || "hacker",
      };

      // Add company information if this is a company account
      if (userType === "company") {
        Object.assign(userData, {
          companyName,
          companyWebsite,
          companySize,
          companyIndustry
        });
      }

      const user = await storage.createUser(userData);

      // Send verification email
      try {
        await sendVerificationEmail(user.id, email, username);
        console.log(`Verification email sent to ${email} for user ${username}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue registration process even if email sending fails
      }

      // Remove password from response
      const userResponse = { ...user } as any;
      delete userResponse.password;

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);

        // Return success response
        res.status(201).json({
          ...userResponse,
          message: "Registration successful! Please check your email to verify your account."
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Email verification endpoint
  app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    try {
      // First, get the user by the verification token to know their ID
      const userByToken = await storage.getUserByVerificationToken(token);
      if (!userByToken) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Then verify the email
      const success = await verifyEmailWithToken(token);

      if (success) {
        // If the user is logged in, update their session
        if (req.isAuthenticated() && req.user) {
          const freshUser = await storage.getUser(req.user.id);
          if (freshUser) {
            req.login(freshUser, () => {});
          }
        }

        // Send welcome email
        try {
          await sendWelcomeEmail(userByToken.id);

          // Create welcome notification
          await storage.createNotification({
            type: 'system',
            message: 'Welcome to CyberHunt! Your account has been verified.',
            link: '/dashboard',
            userId: userByToken.id,
            relatedId: null
          });

          // Create an activity record for the user
          await storage.createActivity({
            userId: userByToken.id,
            type: 'account_verified',
            message: 'Email verified successfully',
            details: 'Account verification completed',
            relatedId: userByToken.id
          });

          // Award initial reputation points for verifying email
          await storage.updateUserReputation(userByToken.id, 10);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Continue verification process even if email sending fails
        }

        return res.status(200).json({ message: "Email verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      return res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });

      req.login(user, (err) => {
        if (err) return next(err);

        // Remove password from response
        const userResponse = { ...user } as any;
        delete userResponse.password;

        res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove password from response
    const user = { ...req.user } as any;
    delete user.password;

    res.json(user);
  });
}