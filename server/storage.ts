import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, programs, submissions, activities, notifications, wallets, transactions, type User, type InsertUser } from '@shared/schema';
import { eq } from 'drizzle-orm';
import createMemoryStore from "memorystore";
import session from "express-session";
import { encrypt, decrypt } from "./crypto-utils";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Initialize PostgreSQL client with pooling
const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(client);

// Example usage in storage methods
async function fallbackToReplitDb(key: string, value: any) {
  return await replitDb.set(key, value);
}

// Only encrypt password
function encryptSensitiveData(data: any) {
  if (data.password) data.password = encrypt(data.password);
  return data;
}

// Only decrypt password
function decryptSensitiveData(data: any) {
  if (!data) return data;
  if (data.password) data.password = decrypt(data.password);
  return data;
}

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User CRUD
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, reputation: number): Promise<User | undefined>;
  getLeaderboard(limit?: number): Promise<User[]>;

  // Email verification
  setVerificationToken(userId: number, token: string, expiryHours?: number): Promise<User | undefined>;
  verifyEmail(token: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;

  // Program CRUD
  getProgram(id: number): Promise<Program | undefined>;
  getAllPrograms(): Promise<Program[]>;
  getPublicPrograms(): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;

  // Submission CRUD
  getSubmission(id: number): Promise<Submission | undefined>;
  getSubmissionsByUser(userId: number): Promise<Submission[]>;
  getSubmissionsByProgram(programId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission & { userId: number }): Promise<Submission>;
  updateSubmissionStatus(id: number, status: string, reward?: number): Promise<Submission | undefined>;

  // Activity CRUD
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

    // Notification CRUD
    getUserNotifications(userId: number, limit?: number): Promise<Notification[]>;
    createNotification(notification: InsertNotification): Promise<Notification>;
    markNotificationAsRead(id: number): Promise<Notification | undefined>;

  // Session storage
  sessionStore: session.SessionStore;
}

// Simple Encryption/Decryption functions (REPLACE WITH A ROBUST CRYPTO LIBRARY)
function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync('password', 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
    const [ivHex, encryptedText] = text.split(':');
    if (!ivHex || !encryptedText) return text; // Return original if not encrypted
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync('password', 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export const storage = {
  async getUserByUsername(username: string) {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },

  async createUser(userData: any) {
    try {
      const result = await db.insert(users).values(userData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async setVerificationToken(userId: number, token: string) {
    try {
      await replitDb.set(`verification_${token}`, userId);
      return true;
    } catch (error) {
      console.error('Error setting verification token:', error);
      return false;
    }
  },

  async getUserByVerificationToken(token: string) {
    try {
      const userId = await replitDb.get(`verification_${token}`);
      if (!userId) return null;
      return await this.getUser(userId);
    } catch (error) {
      console.error('Error getting user by verification token:', error);
      return null;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  async createUser(userData: any) {
    try {
      const result = await db.insert(users).values(userData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      // Fallback to Replit DB
      try {
        const user = { ...userData, id: Date.now() };
        await replitDb.set(`user_${userData.username}`, user);
        return user;
      } catch (e) {
        console.error('Fallback error:', e);
        throw error;
      }
    }
  },

  async getUser(id: number) {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  },

  async getWalletByUserId(userId: number) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  },

  async createWallet(userId: number) {
    const [wallet] = await db.insert(wallets).values({ userId }).returning();
    return wallet;
  },

  async updateWalletBalance(walletId: number, newBalance: number) {
    const [wallet] = await db
      .update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.id, walletId))
      .returning();
    return wallet;
  },

  async createTransaction(data: any) {
    const [transaction] = await db.insert(transactions).values(data).returning();
    return transaction;
  },

  async getTransactionsByWalletId(walletId: number) {
    return db.select().from(transactions).where(eq(transactions.walletId, walletId));
  },

  async getUserNotifications(userId: number, limit?: number) {
        return db.select().from(notifications).where(eq(notifications.userId, userId)).limit(limit || 10);
    },

    async createNotification(notification: InsertNotification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
    },

    async markNotificationAsRead(id: number) {
        const [notification] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
        return notification;
    },
  sessionStore: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),

  async getAllPrograms() {
    try {
      const keys = await replitDb.list('program_');
      const programs = await Promise.all(
        keys.map(key => replitDb.get(key))
      );
      return programs.filter(p => p !== null);
    } catch (error) {
      console.error('Error getting all programs:', error);
      return [];
    }
  },

  async getPublicPrograms() {
    try {
      const programs = await this.getAllPrograms();
      return programs.filter(p => p.isActive);
    } catch (error) {
      console.error('Error getting public programs:', error);
      return [];
    }
  },

  async createProgram(program: any) {
    try {
      const id = Date.now();
      const newProgram = { ...program, id };
      await replitDb.set(`program_${id}`, newProgram);
      return newProgram;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  }
};