import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, desc, asc, gte, lte, and, or, like, sql, count, sum } from "drizzle-orm";
import postgres from 'postgres';
import { users, programs, submissions, activities, notifications, wallets, transactions, withdrawals, publicMessages, triageServices, triageReports, triageCommunications, triageSubscriptions, triageAnalysts, moderationTeam, moderationReviews, moderationComments, moderationAuditLog, moderationNotifications, type User, type InsertUser, type Program, type InsertProgram, type Submission, type InsertSubmission, type Activity, type InsertActivity, type Notification, type InsertNotification, type Wallet, type InsertWithdrawal, type CompanyWallet, type InsertCompanyWallet, type CompanyTransaction, type InsertCompanyTransaction, companyWallets, companyTransactions, paymentMethods, escrowAccounts, paymentIntents, payouts, commissions, transactionLogs, paymentDisputes, paymentRateLimits, type PaymentMethod, type InsertPaymentMethod, type EscrowAccount, type InsertEscrowAccount, type PaymentIntent, type InsertPaymentIntent, type Payout, type InsertPayout, type Commission, type InsertCommission, type TransactionLog, type PaymentDispute, type InsertPaymentDispute, type PublicMessage, type InsertPublicMessage, type TriageService, type TriageReport, type InsertTriageReport, type TriageCommunication, type InsertTriageCommunication, type TriageSubscription, type InsertTriageSubscription, type TriageAnalyst, type InsertTriageAnalyst, type ModerationTeam, type InsertModerationTeam, type ModerationReview, type InsertModerationReview, type ModerationComment, type InsertModerationComment, type ModerationAuditLog, type InsertModerationAuditLog, type ModerationNotification, type InsertModerationNotification, cryptoWallets, cryptoPaymentIntents, cryptoPaymentApprovals,
  cryptoWithdrawals, cryptoTransactions, cryptoNetworkSettings, type CryptoWallet, type InsertCryptoWallet, type CryptoPaymentIntent,
  type InsertCryptoPaymentIntent, type CryptoPaymentApproval, type InsertCryptoPaymentApproval, type CryptoWithdrawal, type InsertCryptoWithdrawal, type CryptoTransaction,
  type InsertCryptoTransaction, type CryptoNetworkSettings, type InsertCryptoNetworkSettings } from '@shared/schema';
import createMemoryStore from "memorystore";
import session from "express-session";
import { encrypt, decrypt } from "./crypto-utils";
import Database from "@replit/database";

const replitDb = new Database();

// Initialize in-memory storage
const memoryStorage = {
  users: new Map(),
  programs: new Map(),
  submissions: new Map(),
  activities: new Map(),
  notifications: new Map(),
  wallets: new Map(),
  transactions: new Map(),
  verificationTokens: new Map()
};

let db: any = null;
if (process.env.DATABASE_URL) {
  const client = postgres(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzle(client);
}

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

  // Payouts and Earnings
  getUserPayouts(userId: number): Promise<Payout[]>;
  getUserSubmissions(userId: number): Promise<Submission[]>;
  getPaymentMethods(): Promise<PaymentMethod[]>;

  // Session storage
  sessionStore: any;
}

export const storage: IStorage = {
  // User methods
  async getUser(id: number) {
    if (db) {
      try {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0] || null;
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    }
    return memoryStorage.users.get(id) || null;
  },

  async getUserByUsername(username: string) {
    if (db) {
      try {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0] || null;
      } catch (error) {
        console.error('Error getting user by username:', error);
        return null;
      }
    }
    return memoryStorage.users.get(username) || null;
  },

  async getUserByEmail(email: string) {
    if (db) {
      try {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0] || null;
      } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
      }
    }
    const userList = Array.from(memoryStorage.users.values());
    for (const user of userList) {
      if (user.email === email) return user;
    }
    return null;
  },

  async createUser(userData: InsertUser) {
    if (db) {
      try {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }

    const user = { ...userData, id: Date.now() };
    memoryStorage.users.set(userData.username, user);
    return user as User;
  },

  async updateUserReputation(id: number, reputation: number) {
    if (db) {
      try {
        const [user] = await db
          .update(users)
          .set({ reputation, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();
        return user;
      } catch (error) {
        console.error('Error updating user reputation:', error);
        return null;
      }
    }
    return null;
  },

  async getLeaderboard(limit = 10) {
    if (db) {
      try {
        return db.select().from(users).orderBy(desc(users.reputation)).limit(limit);
      } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.users.values()).slice(0, limit);
  },

  // Email verification methods
  async setVerificationToken(userId: number, token: string, expiryHours = 24) {
    memoryStorage.verificationTokens.set(token, { userId, expires: Date.now() + (expiryHours * 60 * 60 * 1000) });
    return this.getUser(userId);
  },

  async verifyEmail(token: string) {
    const tokenData = memoryStorage.verificationTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return null;
    }

    if (db) {
      try {
        const [user] = await db
          .update(users)
          .set({ emailVerified: true, updatedAt: new Date() })
          .where(eq(users.id, tokenData.userId))
          .returning();

        memoryStorage.verificationTokens.delete(token);
        return user;
      } catch (error) {
        console.error('Error verifying email:', error);
        return null;
      }
    }
    return null;
  },

  async getUserByVerificationToken(token: string) {
    const tokenData = memoryStorage.verificationTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return undefined;
    }
    return this.getUser(tokenData.userId);
  },

  // Program methods
  async getProgram(id: number) {
    if (db) {
      try {
        const result = await db.select().from(programs).where(eq(programs.id, id));
        return result[0] || null;
      } catch (error) {
        console.error('Error getting program:', error);
        return null;
      }
    }
    return memoryStorage.programs.get(id) || null;
  },

  async getAllPrograms() {
    if (db) {
      try {
        return db.select().from(programs);
      } catch (error) {
        console.error('Error getting all programs:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.programs.values());
  },

  async getPublicPrograms() {
    if (db) {
      try {
        return db.select().from(programs);
      } catch (error) {
        console.error('Error getting public programs:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.programs.values());
  },

  async createProgram(program: InsertProgram) {
    if (db) {
      try {
        const result = await db.insert(programs).values(program).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating program:', error);
        throw error;
      }
    }

    const newProgram = { ...program, id: Date.now() };
    memoryStorage.programs.set(newProgram.id, newProgram);
    return newProgram as Program;
  },

  // Submission methods
  async getSubmission(id: number) {
    if (db) {
      try {
        const result = await db.select().from(submissions).where(eq(submissions.id, id));
        return result[0] || null;
      } catch (error) {
        console.error('Error getting submission:', error);
        return null;
      }
    }
    return memoryStorage.submissions.get(id) || null;
  },

  async getSubmissionsByUser(userId: number) {
    if (db) {
      try {
        return db.select().from(submissions).where(eq(submissions.userId, userId));
      } catch (error) {
        console.error('Error getting submissions by user:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.submissions.values()).filter(s => s.userId === userId);
  },

  async getSubmissionsByProgram(programId: number) {
    if (db) {
      try {
        return db.select().from(submissions).where(eq(submissions.programId, programId));
      } catch (error) {
        console.error('Error getting submissions by program:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.submissions.values()).filter(s => s.programId === programId);
  },

  async createSubmission(submission: InsertSubmission & { userId: number }) {
    if (db) {
      try {
        const result = await db.insert(submissions).values(submission).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating submission:', error);
        throw error;
      }
    }

    const newSubmission = { ...submission, id: Date.now() };
    memoryStorage.submissions.set(newSubmission.id, newSubmission);
    return newSubmission as Submission;
  },

  async updateSubmissionStatus(id: number, status: string, reward?: number) {
    if (db) {
      try {
        const updateData: any = { status, updatedAt: new Date() };
        if (reward !== undefined) {
          updateData.reward = reward;
        }

        const [submission] = await db
          .update(submissions)
          .set(updateData)
          .where(eq(submissions.id, id))
          .returning();
        return submission;
      } catch (error) {
        console.error('Error updating submission status:', error);
        return null;
      }
    }
    return null;
  },

  // Activity methods
  async getUserActivities(userId: number, limit = 10) {
    if (db) {
      try {
        return db.select().from(activities)
          .where(eq(activities.userId, userId))
          .orderBy(desc(activities.createdAt))
          .limit(limit);
      } catch (error) {
        console.error('Error getting user activities:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.activities.values())
      .filter(a => a.userId === userId)
      .slice(0, limit);
  },

  async createActivity(activity: InsertActivity) {
    if (db) {
      try {
        const result = await db.insert(activities).values(activity).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating activity:', error);
        throw error;
      }
    }

    const newActivity = { ...activity, id: Date.now() };
    memoryStorage.activities.set(newActivity.id, newActivity);
    return newActivity as Activity;
  },

  // Notification methods
  async getUserNotifications(userId: number, limit = 10) {
    if (db) {
      try {
        return db.select().from(notifications)
          .where(eq(notifications.userId, userId))
          .orderBy(desc(notifications.createdAt))
          .limit(limit);
      } catch (error) {
        console.error('Error getting user notifications:', error);
        return [];
      }
    }
    return Array.from(memoryStorage.notifications.values())
      .filter(n => n.userId === userId)
      .slice(0, limit);
  },

  async createNotification(notification: InsertNotification) {
    if (db) {
      try {
        const result = await db.insert(notifications).values(notification).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
    }

    const newNotification = { ...notification, id: Date.now() };
    memoryStorage.notifications.set(newNotification.id, newNotification);
    return newNotification as Notification;
  },

  async markNotificationAsRead(id: number) {
    if (db) {
      try {
        const [notification] = await db
          .update(notifications)
          .set({ isRead: true, updatedAt: new Date() })
          .where(eq(notifications.id, id))
          .returning();
        return notification;
      } catch (error) {
        console.error('Error marking notification as read:', error);
        return null;
      }
    }
    return null;
  },

  // Payouts and Earnings
  async getUserPayouts(userId: number) {
    try {
      const result = await db.select().from(payouts).where(eq(payouts.userId, userId));
      return result;
    } catch (error) {
      console.error('Error fetching user payouts:', error);
      return [];
    }
  },

  async getUserSubmissions(userId: number) {
    try {
      const result = await db.select().from(submissions).where(eq(submissions.userId, userId));
      return result;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  },

  async getPaymentMethods() {
    try {
      // Return mock payment methods for now
      return [
        { id: 1, name: 'PayPal', type: 'digital_wallet', supportedCurrencies: ['USD', 'EUR'] },
        { id: 2, name: 'Bitcoin', type: 'crypto', supportedCurrencies: ['BTC'] },
        { id: 3, name: 'Ethereum', type: 'crypto', supportedCurrencies: ['ETH'] },
        { id: 4, name: 'Bank Transfer', type: 'bank_transfer', supportedCurrencies: ['USD'] },
        { id: 5, name: 'USDT (TRC20)', type: 'crypto', supportedCurrencies: ['USDT'] }
      ];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  // Session storage
  sessionStore: new MemoryStore({})
};