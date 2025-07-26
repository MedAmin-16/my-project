import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, desc, asc, gte, lte, and, or, like, sql, count, sum } from "drizzle-orm";
import postgres from 'postgres';
import { users, programs, submissions, activities, notifications, wallets, transactions, withdrawals, publicMessages, triageServices, triageReports, triageCommunications, triageSubscriptions, triageAnalysts, moderationTeam, moderationReviews, moderationComments, moderationAuditLog, moderationNotifications, type User, type InsertUser, type Program, type InsertProgram, type Submission, type InsertSubmission, type Activity, type InsertActivity, type Notification, type InsertNotification, type Wallet, type InsertWithdrawal, type CompanyWallet, type InsertCompanyWallet, type CompanyTransaction, type InsertCompanyTransaction, companyWallets, companyTransactions, paymentMethods, escrowAccounts, paymentIntents, payouts, commissions, transactionLogs, paymentDisputes, paymentRateLimits, type PaymentMethod, type InsertPaymentMethod, type EscrowAccount, type InsertEscrowAccount, type PaymentIntent, type InsertPaymentIntent, type Payout, type InsertPayout, type Commission, type InsertCommission, type TransactionLog, type PaymentDispute, type InsertPaymentDispute, type PublicMessage, type InsertPublicMessage, type TriageService, type InsertTriageReport, type TriageCommunication, type InsertTriageCommunication, type TriageSubscription, type InsertTriageSubscription, type TriageAnalyst, type InsertModerationTeam, type InsertModerationReview, type InsertModerationComment, type InsertModerationAuditLog, type InsertModerationNotification, cryptoWallets, cryptoPaymentIntents, cryptoPaymentApprovals,
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

  // Session storage
  sessionStore: session.SessionStore;
}

// Note: These are simplified functions - using crypto-utils for production encryption

// Create user table aliases for moderation queries
// Note: Using direct joins instead of aliases for simplicity

export const storage = {
  async createWallet(userId: number) {
    if (db) {
      try {
        const [wallet] = await db.insert(wallets).values({ userId, balance: 0 }).returning();
        return wallet;
      } catch (error) {
        console.error('Error creating wallet:', error);
        return null;
      }
    }
    return null;
  },

  async getWalletByUserId(userId: number) {
    if (db) {
      try {
        const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
        return wallet;
      } catch (error) {
        console.error('Error getting wallet:', error);
        return null;
      }
    }
    return null;
  },

  async updateWalletBalance(walletId: number, amount: number) {
    if (db) {
      try {
        const [wallet] = await db
          .update(wallets)
          .set({ balance: amount, updatedAt: new Date() })
          .where(eq(wallets.id, walletId))
          .returning();
        return wallet;
      } catch (error) {
        console.error('Error updating wallet balance:', error);
        return null;
      }
    }
    return null;
  },

  async createWithdrawal(data: InsertWithdrawal) {
    if (db) {
      try {
        const [withdrawal] = await db.insert(withdrawals).values(data).returning();
        return withdrawal;
      } catch (error) {
        console.error('Error creating withdrawal:', error);
        return null;
      }
    }
    return null;
  },

  async getUserWithdrawals(userId: number) {
    if (db) {
      try {
        const userWallet = await this.getWalletByUserId(userId);
        if (!userWallet) return [];
        return db.select().from(withdrawals).where(eq(withdrawals.walletId, userWallet.id));
      } catch (error) {
        console.error('Error getting user withdrawals:', error);
        return [];
      }
    }
    return [];
  },

  async updateWithdrawalStatus(withdrawalId: number, status: string, notes?: string) {
    if (db) {
      try {
        const updateData: any = { 
          status, 
          updatedAt: new Date() 
        };

        if (notes) {
          updateData.notes = notes;
        }

        const [withdrawal] = await db
          .update(withdrawals)
          .set(updateData)
          .where(eq(withdrawals.id, withdrawalId))
          .returning();
        return withdrawal;
      } catch (error) {
        console.error('Error updating withdrawal status:', error);
        return null;
      }
    }
    return null;
  },

  async getAllWithdrawals() {
    if (db) {
      try {
        return db.select({
          id: withdrawals.id,
          amount: withdrawals.amount,
          method: withdrawals.method,
          destination: withdrawals.destination,
          status: withdrawals.status,
          notes: withdrawals.notes,
          createdAt: withdrawals.createdAt,
          updatedAt: withdrawals.updatedAt,
          walletId: withdrawals.walletId,
          userId: wallets.userId,
          username: users.username,
          email: users.email
        })
        .from(withdrawals)
        .leftJoin(wallets, eq(withdrawals.walletId, wallets.id))
        .leftJoin(users, eq(wallets.userId, users.id))
        .orderBy(desc(withdrawals.createdAt));
      } catch (error) {
        console.error('Error getting all withdrawals:', error);
        return [];
      }
    }
    return [];
  },

  async getAdminCryptoWithdrawals(statusFilter?: string) {
    if (db) {
      try {
        let query = db.select({
          id: cryptoWithdrawals.id,
          amount: cryptoWithdrawals.amount,
          currency: cryptoWithdrawals.currency,
          walletAddress: cryptoWithdrawals.walletAddress,
          network: cryptoWithdrawals.network,
          status: cryptoWithdrawals.status,
          createdAt: cryptoWithdrawals.createdAt,
          updatedAt: cryptoWithdrawals.updatedAt,
          userId: cryptoWithdrawals.userId,
          username: users.username,
          email: users.email
        })
        .from(cryptoWithdrawals)
        .leftJoin(users, eq(cryptoWithdrawals.userId, users.id))
        .orderBy(desc(cryptoWithdrawals.createdAt));

        if (statusFilter && statusFilter !== 'all') {
          query = query.where(eq(cryptoWithdrawals.status, statusFilter));
        }

        const results = await query;

        // Decrypt wallet addresses for admin view
        return results.map(withdrawal => ({
          ...withdrawal,
          walletAddress: withdrawal.walletAddress ? this.decryptData(withdrawal.walletAddress) : ''
        }));
      } catch (error) {
        console.error('Error getting admin crypto withdrawals:', error);
        return [];
      }
    }
    return [];
  },

  async getCryptoWithdrawalById(withdrawalId: number) {
    if (db) {
      try {
        const [withdrawal] = await db
          .select()
          .from(cryptoWithdrawals)
          .where(eq(cryptoWithdrawals.id, withdrawalId))
          .limit(1);
        return withdrawal;
      } catch (error) {
        console.error('Error getting crypto withdrawal by ID:', error);
        return null;
      }
    }
    return null;
  },

  async updateCryptoWithdrawalStatus(withdrawalId: number, status: string, notes?: string) {
    if (db) {
      try {
        const updateData: any = { 
          status, 
          updatedAt: new Date() 
        };

        const [withdrawal] = await db
          .update(cryptoWithdrawals)
          .set(updateData)
          .where(eq(cryptoWithdrawals.id, withdrawalId))
          .returning();
        return withdrawal;
      } catch (error) {
        console.error('Error updating crypto withdrawal status:', error);
        return null;
      }
    }
    return null;
  },

  async createAdminAuditLog(logData: {
    adminId: number;
    action: string;
    targetType: string;
    targetId: number;
    details: any;
  }) {
    if (db) {
      try {
        const [log] = await db
          .insert(transactionLogs)
          .values({
            transactionType: logData.targetType,
            transactionId: logData.targetId,
            userId: logData.adminId,
            action: logData.action,
            newState: logData.details,
            metadata: { 
              timestamp: new Date().toISOString(),
              actionBy: 'admin'
            }
          })
          .returning();
        return log;
      } catch (error) {
        console.error('Error creating admin audit log:', error);
        return null;
      }
    }
    return null;
  },

  // Helper method to decrypt data (you'll need to implement this based on your crypto-utils)
  decryptData(encryptedData: string): string {
    try {
      // Import decrypt function from crypto-utils
      const { decrypt } = require('./crypto-utils');
      return decrypt(encryptedData);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData; // Return original if decryption fails
    }
  },

  async getWithdrawalById(withdrawalId: number) {
    if (db) {
      try {
        const [withdrawal] = await db.select({
          id: withdrawals.id,
          amount: withdrawals.amount,
          method: withdrawals.method,
          destination: withdrawals.destination,
          status: withdrawals.status,
          notes: withdrawals.notes,
          createdAt: withdrawals.createdAt,
          updatedAt: withdrawals.updatedAt,
          walletId: withdrawals.walletId,
          userId: wallets.userId,
          username: users.username,
          email: users.email
        })
        .from(withdrawals)
        .leftJoin(wallets, eq(withdrawals.walletId, wallets.id))
        .leftJoin(users, eq(wallets.userId, users.id))
        .where(eq(withdrawals.id, withdrawalId));
        return withdrawal;
      } catch (error) {
        console.error('Error getting withdrawal by ID:', error);
        return null;
      }
    }
    return null;
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

  async createUser(userData: any) {
    if (db) {
      try {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }

    const user = { ...userData, id: Date.now() };
    memoryStorage.users.set(userData.username, user);
    return user;
  },

  async setVerificationToken(userId: number, token: string) {
    memoryStorage.verificationTokens.set(token, userId);
    return true;
  },

  async getUserByVerificationToken(token: string) {
    const userId = memoryStorage.verificationTokens.get(token);
    if (!userId) return null;

    for (const user of memoryStorage.users.values()) {
      if (user.id === userId) return user;
    }
    return null;
  },

  async getUserByEmail(email: string) {
    for (const user of memoryStorage.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  async getUser(id: number) {
    for (const user of memoryStorage.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  },

  async getWalletByUserId(userId: number) {
    if (db) {
      try {
        const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
        return wallet;
      } catch (error) {
        console.error('Error getting wallet by user id:', error);
        return null;
      }
    }
    return null;
  },

  async createWallet(userId: number) {
    if (db) {
      try {
        const [wallet] = await db.insert(wallets).values({ userId }).returning();
        return wallet;
      } catch (error) {
        console.error('Error creating wallet:', error);
        return null;
      }
    }
    return null;
  },

  async updateWalletBalance(walletId: number, newBalance: number) {
    if (db) {
      try {
        const [wallet] = await db
          .update(wallets)
          .set({ balance: newBalance, updatedAt: new Date() })
          .where(eq(wallets.id, walletId))
          .returning();
        return wallet;
      } catch (error) {
        console.error('Error updating wallet balance:', error);
        return null;
      }
    }
    return null;
  },

  async createTransaction(data: any) {
    if (db) {
      try {
        const [transaction] = await db.insert(transactions).values(data).returning();
        return transaction;
      } catch (error) {
        console.error('Error creating transaction:', error);
        return null;
      }
    }
    return null;
  },

  async getTransactionsByWalletId(walletId: number) {
    if (db) {
      try {
        return db.select().from(transactions).where(eq(transactions.walletId, walletId));
      } catch (error) {
        console.error('Error getting transactions by wallet id:', error);
        return [];
      }
    }
    return [];
  },

  async getUserNotifications(userId: number, limit?: number) {
    if (db) {
      try {
        return db.select().from(notifications).where(eq(notifications.userId, userId)).limit(limit || 10);
      } catch (error) {
        console.error('Error getting user notifications:', error);
        return [];
      }
    }
    return [];
  },

  async createNotification(notification: InsertNotification) {
    if (db) {
      try {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
      } catch (error) {
        console.error('Error creating notification:', error);
        return null;
      }
    }
    return null;
  },

  async markNotificationAsRead(id: number) {
    if (db) {
      try {
        const [notification] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
        return notification;
      } catch (error) {
        console.error('Error marking notification as read:', error);
        return null;
      }
    }
    return null;
  },

  sessionStore: new MemoryStore({
    checkPeriod: 86400000,
  }),

  async getAllPrograms() {
    return Array.from(memoryStorage.programs.values());
  },

  async getPublicPrograms() {
    return Array.from(memoryStorage.programs.values()).filter(p => p.isActive);
  },

  async createProgram(program: any) {
    const id = Date.now();
    const newProgram = { ...program, id };
    memoryStorage.programs.set(id, newProgram);
    return newProgram;
  },
  async updateUserReputation(id: number, reputation: number){
    if (db) {
      try {
        const [user] = await db.update(users).set({reputation: reputation}).where(eq(users.id, id)).returning()
        return user
      } catch (error) {
        console.log("Error updating user reputation", error)
        return null
      }
    }
    return null
  },
  async getLeaderboard(limit?: number){
    if(db){
      try {
        return db.select().from(users).orderBy(users.reputation).limit(limit || 10)
      } catch (error) {
        console.log("Error getting leaderboard", error)
        return []
      }
    }
    return []
  },
  async getProgram(id: number){
    if(db){
      try {
        const result = await db.select().from(programs).where(eq(programs.id, id))
        return result[0] || null
      } catch (error) {
        console.log("Error getting program", error)
        return null
      }
    }
    return memoryStorage.programs.get(id) || null
  },
  async createSubmission(submission: any){
    if(db){
      try {
        const result = await db.insert(submissions).values(submission).returning()
        return result[0]
      } catch (error) {
        console.log("Error creating submission", error)
        return null
      }
    }
    return null
  },
  async getSubmission(id: number){
    if(db){
      try {
        const result = await db.select().from(submissions).where(eq(submissions.id, id))
        return result[0] || null
      } catch (error) {
        console.log("Error getting submission", error)
        return null
      }
    }
    return null
  },
  async getSubmissionsByUser(userId: number){
    if(db){
      try {
        return db.select().from(submissions).where(eq(submissions.userId, userId))
      } catch (error) {
        console.log("Error getting submissions by user", error)
        return []
      }
    }
    return []
  },
   async getSubmissionsByProgram(programId: number){
    if(db){
      try {
        return db.select().from(submissions).where(eq(submissions.programId, programId))
      } catch (error) {
        console.log("Error getting submissions by program", error)
        return []
      }
    }
    return []
  },
  async updateSubmissionStatus(id: number, status: string, reward?: number){
    if(db){
      try {
        const [submission] = await db.update(submissions).set({status: status, reward: reward}).where(eq(submissions.id, id)).returning()
        return submission
      } catch (error) {
        console.log("Error updating submission status", error)
        return null
      }
    }
    return null
  },
  async getUserActivities(userId: number, limit?: number){
    if(db){
      try {
        return db.select().from(activities).where(eq(activities.userId, userId)).limit(limit || 10)
      } catch (error) {
        console.log("Error getting user activities", error)
        return []
      }
    }
    return []
  },
  async createActivity(activity: any){
    if(db){
      try {
        const [newActivity] = await db.insert(activities).values(activity).returning()
        return newActivity
      } catch (error) {
        console.log("Error creating activity", error)
        return null
      }
    }
    return null
  },
  async getProgram(id: number){
    if(db){
      try {
        const result = await db.select().from(programs).where(eq(programs.id, id))
        return result[0] || null
      } catch (error) {
        console.log("Error getting program", error)
        return null
      }
    }
    return null
  },

  async updateUserPhoto(userId: number, photoUrl: string) {
    return await db.update(users).set({ photoUrl }).where(eq(users.id, userId)).returning().then(rows => rows[0]);
  },

  async getUserByOAuthId(provider: string, oauthId: string) {
    // For simplicity, we'll store OAuth info in the user record
    // In production, you might want a separate oauth_accounts table
    if (db) {
      try {
        const user = await db.select().from(users).where(
          and(
            eq(users.oauthProvider, provider),
            eq(users.oauthId, oauthId)
          )
        ).then(rows => rows[0]);
        return user;
      } catch (error) {
        console.error('Error getting user by OAuth ID:', error);
        return null;
      }
    }
    return null;
  },

  async linkOAuthAccount(userId: number, provider: string, oauthId: string) {
    if (db) {
      try {
        return await db.update(users).set({ 
          oauthProvider: provider, 
          oauthId: oauthId 
        }).where(eq(users.id, userId));
      } catch (error) {
        console.error('Error linking OAuth account:', error);
        return null;
      }
    }
    return null;
  },

  async getUserWithdrawals(userId: number) {
    if (db) {
      try {
        const userWallet = await this.getWalletByUserId(userId);
        if (!userWallet) return [];
        return db.select().from(withdrawals).where(eq(withdrawals.walletId, userWallet.id));
      } catch (error) {
        console.error('Error getting user withdrawals:', error);
        return [];
      }
    }
    return [];
  },

  async updateWithdrawalStatus(withdrawalId: number, status: string, notes?: string) {
    if (db) {
      try {
        const updateData: any = { 
          status, 
          updatedAt: new Date() 
        };

        if (notes) {
          updateData.notes = notes;
        }

        const [withdrawal] = await db
          .update(withdrawals)
          .set(updateData)
          .where(eq(withdrawals.id, withdrawalId))
          .returning();
        return withdrawal;
      } catch (error) {
        console.error('Error updating withdrawal status:', error);
        return null;
      }
    }
    return null;
  },

  async getAllWithdrawals() {
    if (db) {
      try {
        return db.select({
          id: withdrawals.id,
          amount: withdrawals.amount,
          method: withdrawals.method,
          destination: withdrawals.destination,
          status: withdrawals.status,
          notes: withdrawals.notes,
          createdAt: withdrawals.createdAt,
          updatedAt: withdrawals.updatedAt,
          walletId: withdrawals.walletId,
          userId: wallets.userId,
          username: users.username,
          email: users.email
        })
        .from(withdrawals)
        .leftJoin(wallets, eq(withdrawals.walletId, wallets.id))
        .leftJoin(users, eq(wallets.userId, users.id))
        .orderBy(desc(withdrawals.createdAt));
      } catch (error) {
        console.error('Error getting all withdrawals:', error);
        return [];
      }
    }
    return [];
  },

  async getAdminCryptoWithdrawals(statusFilter?: string) {
    if (db) {
      try {
        let query = db.select({
          id: cryptoWithdrawals.id,
          amount: cryptoWithdrawals.amount,
          currency: cryptoWithdrawals.currency,
          walletAddress: cryptoWithdrawals.walletAddress,
          network: cryptoWithdrawals.network,
          status: cryptoWithdrawals.status,
          createdAt: cryptoWithdrawals.createdAt,
          updatedAt: cryptoWithdrawals.updatedAt,
          userId: cryptoWithdrawals.userId,
          username: users.username,
          email: users.email
        })
        .from(cryptoWithdrawals)
        .leftJoin(users, eq(cryptoWithdrawals.userId, users.id))
        .orderBy(desc(cryptoWithdrawals.createdAt));

        if (statusFilter && statusFilter !== 'all') {
          query = query.where(eq(cryptoWithdrawals.status, statusFilter));
        }

        const results = await query;

        // Decrypt wallet addresses for admin view
        return results.map(withdrawal => ({
          ...withdrawal,
          walletAddress: withdrawal.walletAddress ? this.decryptData(withdrawal.walletAddress) : ''
        }));
      } catch (error) {
        console.error('Error getting admin crypto withdrawals:', error);
        return [];
      }
    }
    return [];
  },

  async getCryptoWithdrawalById(withdrawalId: number) {
    if (db) {
      try {
        const [withdrawal] = await db
          .select()
          .from(cryptoWithdrawals)
          .where(eq(cryptoWithdrawals.id, withdrawalId))
          .limit(1);
        return withdrawal;
      } catch (error) {
        console.error('Error getting crypto withdrawal by ID:', error);
        return null;
      }
    }
    return null;
  },

  async updateCryptoWithdrawalStatus(withdrawalId: number, status: string, notes?: string) {
    if (db) {
      try {
        const updateData: any = { 
          status, 
          updatedAt: new Date() 
        };

        const [withdrawal] = await db
          .update(cryptoWithdrawals)
          .set(updateData)
          .where(eq(cryptoWithdrawals.id, withdrawalId))
          .returning();
        return withdrawal;
      } catch (error) {
        console.error('Error updating crypto withdrawal status:', error);
        return null;
      }
    }
    return null;
  },

  async createAdminAuditLog(logData: {
    adminId: number;
    action: string;
    targetType: string;
    targetId: number;
    details: any;
  }) {
    if (db) {
      try {
        const [log] = await db
          .insert(transactionLogs)
          .values({
            transactionType: logData.targetType,
            transactionId: logData.targetId,
            userId: logData.adminId,
            action: logData.action,
            newState: logData.details,
            metadata: { 
              timestamp: new Date().toISOString(),
              actionBy: 'admin'
            }
          })
          .returning();
        return log;
      } catch (error) {
        console.error('Error creating admin audit log:', error);
        return null;
      }
    }
    return null;
  },

  // Helper method to decrypt data (you'll need to implement this based on your crypto-utils)
  decryptData(encryptedData: string): string {
    try {
      // Import decrypt function from crypto-utils
      const { decrypt } = require('./crypto-utils');
      return decrypt(encryptedData);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData; // Return original if decryption fails
    }
  },

  // Company Wallet Methods
  async getCompanyWallet(companyId: number) {
    if(db){
        try {
            const [wallet] = await db.select().from(companyWallets).where(eq(companyWallets.companyId, companyId));
            return wallet || null;
        } catch (error) {
            console.error('Error getting company wallet:', error);
            return null;
        }
    }
    return null
  },

  async createCompanyWallet(companyId: number) {
    if(db){
        try {
            const [wallet] = await db.insert(companyWallets).values({
                companyId,
                balance: 0,
                totalPaid: 0,
                lastUpdated: new Date()
            }).returning();
            return wallet;
        } catch (error) {
            console.error('Error creating company wallet:', error);
            return null;
        }
    }
    return null
  },

  async updateCompanyWalletBalance(companyId: number, amount: number) {
    if(db){
        try {
            const wallet = await this.getCompanyWallet(companyId);
            if (!wallet) {
                await this.createCompanyWallet(companyId);
            }

            await db.update(companyWallets)
                .set({
                    balance: sql`${companyWallets.balance} + ${amount}`,
                    totalPaid: sql`${companyWallets.totalPaid} + ${amount}`,
                    lastUpdated: new Date()
                })
                .where(eq(companyWallets.companyId, companyId));
        } catch (error) {
            console.error('Error updating company wallet balance:', error);
        }
    }

  },

  async getAllCompanyWallets() {
    if(db){
        try {
            return db.select({
                id: companyWallets.id,
                companyId: companyWallets.companyId,
                balance: companyWallets.balance,
                totalPaid: companyWallets.totalPaid,
                lastUpdated: companyWallets.lastUpdated,
                companyName: users.companyName,
                email: users.email
            }).from(companyWallets)
                .leftJoin(users, eq(companyWallets.companyId, users.id))
                .where(eq(users.userType, 'company'));
        } catch (error) {
            console.error('Error getting all company wallets:', error);
            return [];
        }
    }
    return []
  },

  async createCompanyTransaction(data: InsertCompanyTransaction) {
      if(db){
          try {
              const [transaction] = await db.insert(companyTransactions).values(data).returning();
              return transaction;
          } catch (error) {
              console.error('Error creating company transaction:', error);
              return null;
          }
      }
      return null
  },

  // Public Chat Methods
  async createPublicMessage(data: InsertPublicMessage & { userId: number }) {
    if (db) {
      try {
        const [message] = await db.insert(publicMessages).values(data).returning();
        return message;
      } catch (error) {
        console.error('Error creating public message:', error);
        return null;
      }
    }
    return null;
  },

  async getPublicMessages(limit: number = 50, offset: number = 0) {
    if (db) {
      try {
        return await db.select({
          id: publicMessages.id,
          content: publicMessages.content,
          messageType: publicMessages.messageType,
          isEdited: publicMessages.isEdited,
          editedAt: publicMessages.editedAt,
          createdAt: publicMessages.createdAt,
          userId: publicMessages.userId,
          username: users.username,
          userType: users.userType,
          companyName: users.companyName,
          rank: users.rank
        })
        .from(publicMessages)
        .leftJoin(users, eq(publicMessages.userId, users.id))
        .orderBy(desc(publicMessages.createdAt))
        .limit(limit)
        .offset(offset);
      } catch (error) {
        console.error('Error getting public messages:', error);
        return [];
      }
    }
    return [];
  },

  async deletePublicMessage(messageId: number, userId: number) {
    if (db) {
      try {
        // Only allow users to delete their own messages
        const [deleted] = await db.delete(publicMessages)
          .where(and(eq(publicMessages.id, messageId), eq(publicMessages.userId, userId)))
          .returning();
        return deleted;
      } catch (error) {
        console.error('Error deleting public message:', error);
        return null;
      }
    }
    return null;
  },

  async getCompanyTransactions(companyId: number) {
    if(db){
        try {
            return db.select().from(companyTransactions)
                .where(eq(companyTransactions.companyId, companyId))
                .orderBy(desc(companyTransactions.createdAt));
        } catch (error) {
            console.error('Error getting company transactions:', error);
            return [];
        }
    }
    return []
  },

  async getAllCompanies() {
    if(db){
        try {
            return db.select().from(users).where(eq(users.userType, 'company'));
        } catch (error) {
            console.error('Error getting all companies:', error);
            return [];
        }
    }
    return []
  },

  // Payment Methods
  async getPaymentMethods() {
    if (db) {
      try {
        return db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true));
      } catch (error) {
        console.error('Error getting payment methods:', error);
        return [];
      }
    }
    return [];
  },

  async createPaymentMethod(data: InsertPaymentMethod) {
    if (db) {
      try {
        const [paymentMethod] = await db.insert(paymentMethods).values(data).returning();
        return paymentMethod;
      } catch (error) {
        console.error('Error creating payment method:', error);
        return null;
      }
    }
    return null;
  },

  // Payment Intents
  async createPaymentIntent(data: InsertPaymentIntent) {
    if (db) {
      try {
        const [paymentIntent] = await db.insert(paymentIntents).values(data).returning();

        // Log transaction
        await this.logTransaction('payment_intent', paymentIntent.id, data.companyId, 'created', null, paymentIntent);

        return paymentIntent;
      } catch (error) {
        console.error('Error creating payment intent:', error);
        return null;
      }
    }
    return null;
  },

  async updatePaymentIntent(id: number, status: string, stripePaymentIntentId?: string) {
    if (db) {
      try {
        const [paymentIntent] = await db
          .update(paymentIntents)
          .set({ 
            status, 
            stripePaymentIntentId,
            updatedAt: new Date() 
          })
          .where(eq(paymentIntents.id, id))
          .returning();

        await this.logTransaction('payment_intent', id, paymentIntent.companyId, 'updated', null, paymentIntent);

        return paymentIntent;
      } catch (error) {
        console.error('Error updating payment intent:', error);
        return null;
      }
    }
    return null;
  },

  async getPaymentIntent(id: number) {
    if (db) {
      try {
        const [paymentIntent] = await db.select().from(paymentIntents).where(eq(paymentIntents.id, id));
        return paymentIntent;
      } catch (error) {
        console.error('Error getting payment intent:', error);
        return null;
      }
    }
    return null;
  },

  // Escrow Accounts
  async createEscrowAccount(data: InsertEscrowAccount) {
    if (db) {
      try {
        const [escrow] = await db.insert(escrowAccounts).values(data).returning();

        await this.logTransaction('escrow', escrow.id, data.companyId, 'created', null, escrow);

        return escrow;
      } catch (error) {
        console.error('Error creating escrow account:', error);
        return null;
      }
    }
    return null;
  },

  async updateEscrowStatus(id: number, status: string) {
    if (db) {
      try {
        const [escrow] = await db
          .update(escrowAccounts)
          .set({ status, updatedAt: new Date() })
          .where(eq(escrowAccounts.id, id))
          .returning();

        await this.logTransaction('escrow', id, escrow.companyId, 'updated', null, escrow);

        return escrow;
      } catch (error) {
        console.error('Error updating escrow status:', error);
        return null;
      }
    }
    return null;
  },

  async getEscrowBySubmission(submissionId: number) {
    if (db) {
      try {
        const [escrow] = await db.select().from(escrowAccounts).where(eq(escrowAccounts.submissionId, submissionId));
        return escrow;
      } catch (error) {
        console.error('Error getting escrow by submission:', error);
        return null;
      }
    }
    return null;
  },

  // Payouts
  async createPayout(data: InsertPayout) {
    if (db) {
      try {
        const [payout] = await db.insert(payouts).values(data).returning();

        await this.logTransaction('payout', payout.id, data.userId, 'created', null, payout);

        return payout;
      } catch (error) {
        console.error('Error creating payout:', error);
        return null;
      }
    }
    return null;
  },

  async updatePayoutStatus(id: number, status: string, externalTransactionId?: string, failureReason?: string) {
    if (db) {
      try {
        const updateData: any = { 
          status, 
          updatedAt: new Date() 
        };

        if (externalTransactionId) updateData.externalTransactionId = externalTransactionId;
        if (failureReason) updateData.failureReason = failureReason;
        if (status === 'completed') updateData.completedAt = new Date();

        const [payout] = await db
          .update(payouts)
          .set(updateData)
          .where(eq(payouts.id, id))
          .returning();

        await this.logTransaction('payout', id, payout.userId, 'updated', null, payout);

        return payout;
      } catch (error) {
        console.error('Error updating payout status:', error);
        return null;
      }
    }
    return null;
  },

  async getUserPayouts(userId: number) {
    if (db) {
      try {
        return db.select({
          id: payouts.id,
          amount: payouts.amount,
          currency: payouts.currency,
          status: payouts.status,
          completedAt: payouts.completedAt,
          createdAt: payouts.createdAt,
          submissionTitle: submissions.title,
          paymentMethodName: paymentMethods.name
        })
        .from(payouts)
        .leftJoin(submissions, eq(payouts.submissionId, submissions.id))
        .leftJoin(paymentMethods, eq(payouts.paymentMethodId, paymentMethods.id))
        .where(eq(payouts.userId, userId))
        .orderBy(desc(payouts.createdAt));
      } catch (error) {
        console.error('Error getting user payouts:', error);
        return [];
      }
    }
    return [];
  },

  // Commissions
  async createCommission(data: InsertCommission) {
    if (db) {
      try {
        const [commission] = await db.insert(commissions).values(data).returning();

        await this.logTransaction('commission', commission.id, null, 'created', null, commission);

        return commission;
      } catch (error) {
        console.error('Error creating commission:', error);
        return null;
      }
    }
    return null;
  },

  async getTotalCommissions(startDate?: Date, endDate?: Date) {
    if (db) {
      try {
        // Simple approach without complex SQL templates
        const collectedCommissions = await db.select().from(commissions).where(eq(commissions.status, 'collected'));

        let filteredCommissions = collectedCommissions;
        if (startDate && endDate) {
          filteredCommissions = collectedCommissions.filter(c => 
            c.createdAt && c.createdAt >= startDate && c.createdAt <= endDate
          );
        }

        const totalCommissions = filteredCommissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
        const count = filteredCommissions.length;

        return { totalCommissions, count };
      } catch (error) {
        console.error('Error getting total commissions:', error);
        return { totalCommissions: 0, count: 0 };
      }
    }
    return { totalCommissions: 0, count: 0 };
  },

  // Payment Disputes
  async createPaymentDispute(data: InsertPaymentDispute) {
    if (db) {
      try {
        const [dispute] = await db.insert(paymentDisputes).values(data).returning();

        await this.logTransaction('dispute', dispute.id, data.disputedBy, 'created', null, dispute);

        return dispute;
      } catch (error) {
        console.error('Error creating payment dispute:', error);
        return null;
      }
    }
    return null;
  },

  async updatePaymentDispute(id: number, status: string, resolution?: string, resolvedBy?: number) {
    if (db) {
      try {
        const updateData: any = { 
          status, 
          updatedAt: new Date() 
        };

        if (resolution) updateData.resolution = resolution;
        if (resolvedBy) updateData.resolvedBy = resolvedBy;
        if (status === 'resolved') updateData.resolvedAt = new Date();

        const [dispute] = await db
          .update(paymentDisputes)
          .set(updateData)
          .where(eq(paymentDisputes.id, id))
          .returning();

        await this.logTransaction('dispute', id, dispute.disputedBy, 'updated', null, dispute);

        return dispute;
      } catch (error) {
        console.error('Error updating payment dispute:', error);
        return null;
      }
    }
    return null;
  },

  async getAllPaymentDisputes() {
    if (db) {
      try {
        return db.select({
          id: paymentDisputes.id,
          disputeType: paymentDisputes.disputeType,
          description: paymentDisputes.description,
          status: paymentDisputes.status,
          resolution: paymentDisputes.resolution,
          createdAt: paymentDisputes.createdAt,
          resolvedAt: paymentDisputes.resolvedAt,
          submissionTitle: submissions.title,
          disputedByName: users.username
        })
        .from(paymentDisputes)
        .leftJoin(submissions, eq(paymentDisputes.submissionId, submissions.id))
        .leftJoin(users, eq(paymentDisputes.disputedBy, users.id))
        .orderBy(desc(paymentDisputes.createdAt));
      } catch (error) {
        console.error('Error getting payment disputes:', error);
        return [];
      }
    }
    return [];
  },

  // Transaction Logging
  async logTransaction(
    transactionType: string, 
    transactionId: number, 
    userId: number | null, 
    action: string, 
    previousState: any, 
    newState: any, 
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (db) {
      try {
        await db.insert(transactionLogs).values({
          transactionType,
          transactionId,
          userId,
          action,
          previousState,
          newState,
          metadata,
          ipAddress,
          userAgent
        });
      } catch (error) {
        console.error('Error logging transaction:', error);
      }
    }
  },

  // Rate Limiting
  async checkRateLimit(userId: number | null, ipAddress: string, actionType: string, maxAttempts: number = 5, windowMinutes: number = 15) {
    if (db) {
      try {
        const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

        const results = await db.select()
          .from(paymentRateLimits)
          .where(
            and(
              userId ? eq(paymentRateLimits.userId, userId) : eq(paymentRateLimits.ipAddress, ipAddress),
              eq(paymentRateLimits.actionType, actionType)
            )
          );

        const existing = results.find(r => r.windowStart && r.windowStart > windowStart);

        if (existing) {
          if (existing.attemptCount >= maxAttempts) {
            // Update blocked until time
            await db.update(paymentRateLimits)
              .set({ 
                blockedUntil: new Date(Date.now() + windowMinutes * 60 * 1000),
                attemptCount: existing.attemptCount + 1
              })
              .where(eq(paymentRateLimits.id, existing.id));

            return false; // Rate limited
          } else {
            // Increment attempt count
            await db.update(paymentRateLimits)
              .set({ attemptCount: existing.attemptCount + 1 })
              .where(eq(paymentRateLimits.id, existing.id));
          }
        } else {
          // Create new rate limit record
          await db.insert(paymentRateLimits).values({
            userId,
            ipAddress,
            actionType,
            attemptCount: 1,
            windowStart: new Date()
          });
        }

        return true; // Not rate limited
      } catch (error) {
        console.error('Error checking rate limit:', error);
        return true; // Allow on error
      }
    }
    return true;
  },

  // Analytics
  async getPaymentAnalytics(startDate?: Date, endDate?: Date) {
    if (db) {
      try {
        // Simple date filtering without complex SQL templates
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Simple approach without complex SQL templates
        const allPayments = await db.select().from(paymentIntents).where(eq(paymentIntents.status, 'succeeded'));
        const allPayouts = await db.select().from(payouts).where(eq(payouts.status, 'completed'));
        const allEscrow = await db.select().from(escrowAccounts).where(eq(escrowAccounts.status, 'held'));

        // Filter by date if provided
        let filteredPayments = allPayments;
        let filteredPayouts = allPayouts;

        if (startDate && endDate) {
          filteredPayments = allPayments.filter(p => p.createdAt && p.createdAt >= startDate && p.createdAt <= endDate);
          filteredPayouts = allPayouts.filter(p => p.createdAt && p.createdAt >= startDate && p.createdAt <= endDate);
        } else {
          // Default to last 30 days
          filteredPayments = allPayments.filter(p => p.createdAt && p.createdAt >= thirtyDaysAgo);
          filteredPayouts = allPayouts.filter(p => p.createdAt && p.createdAt >= thirtyDaysAgo);
        }

        const totalPayments = {
          count: filteredPayments.length,
          total: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
        };

        const totalPayouts = {
          count: filteredPayouts.length,
          total: filteredPayouts.reduce((sum, p) => sum + (p.amount || 0), 0)
        };

        const pendingEscrow = {
          count: allEscrow.length,
          total: allEscrow.reduce((sum, e) => sum + (e.amount || 0), 0)
        };

        return {
          totalPayments: totalPayments[0] || { count: 0, total: 0 },
          totalPayouts: totalPayouts[0] || { count: 0, total: 0 },
          pendingEscrow: pendingEscrow[0] || { count: 0, total: 0 }
        };
      } catch (error) {
        console.error('Error getting payment analytics:', error);
        return {
          totalPayments: { count: 0, total: 0 },
          totalPayouts: { count: 0, total: 0 },
          pendingEscrow: { count: 0, total: 0 }
        };
      }
    }
    return {
      totalPayments: { count: 0, total: 0 },
      totalPayouts: { count: 0, total: 0 },
      pendingEscrow: { count: 0, total: 0 }
    };
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

  // Triage Services
  async createTriageService(data: InsertTriageService) {
    if (db) {
      try {
        const [service] = await db.insert(triageServices).values(data).returning();
        return service;
      } catch (error) {
        console.error('Error creating triage service:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageServicesByCompany(companyId: number) {
    if (db) {
      try {
        return db.select().from(triageServices).where(eq(triageServices.companyId, companyId));
      } catch (error) {
        console.error('Error getting triage services by company:', error);
        return [];
      }
    }
    return [];
  },

  async getTriageService(id: number) {
    if (db) {
      try {
        const [service] = await db.select().from(triageServices).where(eq(triageServices.id, id));
        return service || null;
      } catch (error) {
        console.error('Error getting triage service:', error);
        return null;
      }
    }
    return null;
  },

  async updateTriageService(id: number, data: Partial<InsertTriageService>) {
    if (db) {
      try {
        const [service] = await db
          .update(triageServices)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(triageServices.id, id))
          .returning();
        return service;
      } catch (error) {
        console.error('Error updating triage service:', error);
        return null;
      }
    }
    return null;
  },

  // Triage Reports
  async createTriageReport(data: InsertTriageReport) {
    if (db) {
      try {
        const [report] = await db.insert(triageReports).values(data).returning();
        return report;
      } catch (error) {
        console.error('Error creating triage report:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageReport(id: number) {
    if (db) {
      try {
        const [report] = await db.select({
          id: triageReports.id,
          submissionId: triageReports.submissionId,
          triageServiceId: triageReports.triageServiceId,
          companyId: triageReports.companyId,
          triageAnalystId: triageReports.triageAnalystId,
          status: triageReports.status,
          priority: triageReports.priority,
          severity: triageReports.severity,
          validationStatus: triageReports.validationStatus,
          triageNotes: triageReports.triageNotes,
          technicalAssessment: triageReports.technicalAssessment,
          businessImpact: triageReports.businessImpact,
          recommendedActions: triageReports.recommendedActions,
          estimatedFixTime: triageReports.estimatedFixTime,
          cveReference: triageReports.cveReference,
          isEscalated: triageReports.isEscalated,
          escalationReason: triageReports.escalationReason,
          communicationHistory: triageReports.communicationHistory,
          triageStartedAt: triageReports.triageStartedAt,
          triageCompletedAt: triageReports.triageCompletedAt,
          dueDate: triageReports.dueDate,
          createdAt: triageReports.createdAt,
          updatedAt: triageReports.updatedAt,
          // Join submission details
          submissionTitle: submissions.title,
          submissionDescription: submissions.description,
          submissionSeverity: submissions.severity,
          submissionStatus: submissions.status,
          // Join analyst details
          analystUsername: users.username,
          analystEmail: users.email
        })
        .from(triageReports)
        .leftJoin(submissions, eq(triageReports.submissionId, submissions.id))
        .leftJoin(users, eq(triageReports.triageAnalystId, users.id))
        .where(eq(triageReports.id, id));

        return report || null;
      } catch (error) {
        console.error('Error getting triage report:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageReportsByCompany(companyId: number) {
    if (db) {
      try {
        return db.select({
          id: triageReports.id,
          submissionId: triageReports.submissionId,
          status: triageReports.status,
          priority: triageReports.priority,
          severity: triageReports.severity,
          validationStatus: triageReports.validationStatus,
          dueDate: triageReports.dueDate,
          createdAt: triageReports.createdAt,
          updatedAt: triageReports.updatedAt,
          submissionTitle: submissions.title,
          submissionDescription: submissions.description,
          analystUsername: users.username
        })
        .from(triageReports)
        .leftJoin(submissions, eq(triageReports.submissionId, submissions.id))
        .leftJoin(users, eq(triageReports.triageAnalystId, users.id))
        .where(eq(triageReports.companyId, companyId))
        .orderBy(desc(triageReports.createdAt));
      } catch (error) {
        console.error('Error getting triage reports by company:', error);
        return [];
      }
    }
    return [];
  },

  async getTriageReportBySubmission(submissionId: number) {
    if (db) {
      try {
        const [report] = await db.select().from(triageReports).where(eq(triageReports.submissionId, submissionId));
        return report || null;
      } catch (error) {
        console.error('Error getting triage report by submission:', error);
        return null;
      }
    }
    return null;
  },

  async updateTriageReport(id: number, data: Partial<InsertTriageReport>) {
    if (db) {
      try {
        const [report] = await db
          .update(triageReports)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(triageReports.id, id))
          .returning();
        return report;
      } catch (error) {
        console.error('Error updating triage report:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageReportsByAnalyst(analystId: number) {
    if (db) {
      try {
        return db.select({
          id: triageReports.id,
          submissionId: triageReports.submissionId,
          status: triageReports.status,
          priority: triageReports.priority,
          severity: triageReports.severity,
          dueDate: triageReports.dueDate,
          createdAt: triageReports.createdAt,
          submissionTitle: submissions.title,
          companyName: users.companyName
        })
        .from(triageReports)
        .leftJoin(submissions, eq(triageReports.submissionId, submissions.id))
        .leftJoin(users, eq(triageReports.companyId, users.id))
        .where(eq(triageReports.triageAnalystId, analystId))
        .orderBy(desc(triageReports.createdAt));
      } catch (error) {
        console.error('Error getting triage reports by analyst:', error);
        return [];
      }
    }
    return [];
  },

  // Triage Communications
  async createTriageCommunication(data: InsertTriageCommunication) {
    if (db) {
      try {
        const [communication] = await db.insert(triageCommunications).values(data).returning();
        return communication;
      } catch (error) {
        console.error('Error creating triage communication:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageCommunications(triageReportId: number) {
    if (db) {
      try {
        return db.select({
          id: triageCommunications.id,
          triageReportId: triageCommunications.triageReportId,
          fromUserId: triageCommunications.fromUserId,
          toUserId: triageCommunications.toUserId,
          messageType: triageCommunications.messageType,
          subject: triageCommunications.subject,
          message: triageCommunications.message,
          isInternal: triageCommunications.isInternal,
          attachments: triageCommunications.attachments,
          isRead: triageCommunications.isRead,
          readAt: triageCommunications.readAt,
          createdAt: triageCommunications.createdAt,
          fromUsername: users.username,
          fromUserType: users.userType
        })
        .from(triageCommunications)
        .leftJoin(users, eq(triageCommunications.fromUserId, users.id))
        .where(eq(triageCommunications.triageReportId, triageReportId))
        .orderBy(desc(triageCommunications.createdAt));
      } catch (error) {
        console.error('Error getting triage communications:', error);
        return [];
      }
    }
    return [];
  },

  async markTriageCommunicationAsRead(id: number) {
    if (db) {
      try {
        const [communication] = await db
          .update(triageCommunications)
          .set({ isRead: true, readAt: new Date() })
          .where(eq(triageCommunications.id, id))
          .returning();
        return communication;
      } catch (error) {
        console.error('Error marking triage communication as read:', error);
        return null;
      }
    }
    return null;
  },

  // Triage Subscriptions
  async createTriageSubscription(data: InsertTriageSubscription) {
    if (db) {
      try {
        const [subscription] = await db.insert(triageSubscriptions).values(data).returning();
        return subscription;
      } catch (error) {
        console.error('Error creating triage subscription:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageSubscriptionsByCompany(companyId: number) {
    if (db) {
      try {
        return db.select({
          id: triageSubscriptions.id,
          triageServiceId: triageSubscriptions.triageServiceId,
          subscriptionType: triageSubscriptions.subscriptionType,
          status: triageSubscriptions.status,
          startDate: triageSubscriptions.startDate,
          endDate: triageSubscriptions.endDate,
          autoRenew: triageSubscriptions.autoRenew,
          reportsProcessed: triageSubscriptions.reportsProcessed,
          totalCost: triageSubscriptions.totalCost,
          nextBillingDate: triageSubscriptions.nextBillingDate,
          createdAt: triageSubscriptions.createdAt,
          serviceName: triageServices.serviceName,
          serviceType: triageServices.serviceType,
          triageLevel: triageServices.triageLevel
        })
        .from(triageSubscriptions)
        .leftJoin(triageServices, eq(triageSubscriptions.triageServiceId, triageServices.id))
        .where(eq(triageSubscriptions.companyId, companyId))
        .orderBy(desc(triageSubscriptions.createdAt));
      } catch (error) {
        console.error('Error getting triage subscriptions by company:', error);
        return [];
      }
    }
    return [];
  },

  async updateTriageSubscription(id: number, data: Partial<InsertTriageSubscription>) {
    if (db) {
      try {
        const [subscription] = await db
          .update(triageSubscriptions)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(triageSubscriptions.id, id))
          .returning();
        return subscription;
      } catch (error) {
        console.error('Error updating triage subscription:', error);
        return null;
      }
    }
    return null;
  },

  // Triage Analysts
  async createTriageAnalyst(data: InsertTriageAnalyst) {
    if (db) {
      try {
        const [analyst] = await db.insert(triageAnalysts).values(data).returning();
        return analyst;
      } catch (error) {
        console.error('Error creating triage analyst:', error);
        return null;
      }
    }
    return null;
  },

  async getAvailableTriageAnalysts() {
    if (db) {
      try {
        return db.select({
          id: triageAnalysts.id,
          userId: triageAnalysts.userId,
          specializations: triageAnalysts.specializations,
          currentWorkload: triageAnalysts.currentWorkload,
          maxWorkload: triageAnalysts.maxWorkload,
          availabilityStatus: triageAnalysts.availabilityStatus,
          performanceRating: triageAnalysts.performanceRating,
          avgResponseTime: triageAnalysts.avgResponseTime,
          username: users.username,
          email: users.email
        })
        .from(triageAnalysts)
        .leftJoin(users, eq(triageAnalysts.userId, users.id))
        .where(eq(triageAnalysts.availabilityStatus, 'available'))
        .orderBy(triageAnalysts.performanceRating, triageAnalysts.currentWorkload);
      } catch (error) {
        console.error('Error getting available triage analysts:', error);
        return [];
      }
    }
    return [];
  },

  async updateTriageAnalystWorkload(analystId: number, workload: number) {
    if (db) {
      try {
        const [analyst] = await db
          .update(triageAnalysts)
          .set({ currentWorkload: workload, updatedAt: new Date() })
          .where(eq(triageAnalysts.id, analystId))
          .returning();
        return analyst;
      } catch (error) {
        console.error('Error updating triage analyst workload:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageAnalyst(id: number) {
    if (db) {
      try {
        const [analyst] = await db.select().from(triageAnalysts).where(eq(triageAnalysts.id, id));
        return analyst || null;
      } catch (error) {
        console.error('Error getting triage analyst:', error);
        return null;
      }
    }
    return null;
  },

  async getTriageAnalystByUserId(userId: number) {
    if (db) {
      try {
        const [analyst] = await db.select().from(triageAnalysts).where(eq(triageAnalysts.userId, userId));
        return analyst || null;
      } catch (error) {
        console.error('Error getting triage analyst by user ID:', error);
        return null;
      }
    }
    return null;
  },

  // Moderation System Functions
  async getModerationTeamMember(userId: number) {
    if (db) {
    try {
      const [member] = await db.select()
        .from(moderationTeam)
        .where(and(
          eq(moderationTeam.userId, userId),
          eq(moderationTeam.isActive, true)
        ));
      return member;
    } catch (error) {
      console.error('Error getting moderation team member:', error);
      return null;
    }
    }
    return null;
  },

  async getModerationTeamMembers(department?: string) {
    if (db) {
    try {
      let query = db.select({
        id: moderationTeam.id,
        userId: moderationTeam.userId,
        username: users.username,
        role: moderationTeam.role,
        department: moderationTeam.department,
        permissions: moderationTeam.permissions,
        specializations: moderationTeam.specializations,
        maxAssignments: moderationTeam.maxAssignments,
        currentAssignments: moderationTeam.currentAssignments,
        isActive: moderationTeam.isActive,
        createdAt: moderationTeam.createdAt
      })
      .from(moderationTeam)
      .leftJoin(users, eq(moderationTeam.userId, users.id))
      .where(eq(moderationTeam.isActive, true));

      if (department) {
        query = query.where(eq(moderationTeam.department, department));
      }

      return await query;
    } catch (error) {
      console.error('Error getting moderation team members:', error);
      return [];
    }
    }
    return [];
  },

  async createModerationTeamMember(data: InsertModerationTeam) {
    if (db) {
    try {
      const [member] = await db.insert(moderationTeam)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return member;
    } catch (error) {
      console.error('Error creating moderation team member:', error);
      return null;
    }
    }
    return null;
  },

  async updateModerationTeamMember(id: number, data: Partial<InsertModerationTeam>) {
    if (db) {
    try {
      const [updated] = await db.update(moderationTeam)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(moderationTeam.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating moderation team member:', error);
      return null;
    }
    }
    return null;
  },

  async getModerationReviews(filters: {
    reviewerId?: number;
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    if (db) {
    try {
      const { reviewerId, status, priority, category, limit = 50, offset = 0 } = filters;

      let query = db.select({
        id: moderationReviews.id,
        submissionId: moderationReviews.submissionId,
        submissionTitle: submissions.title,
        submissionDescription: submissions.description,
        submissionType: submissions.type,
        submissionSeverity: submissions.severity,
        submissionStatus: submissions.status,
        submissionCreatedAt: submissions.createdAt,
        submissionUserId: submissions.userId,
        submissionUserUsername: users.username,
        reviewerId: moderationReviews.reviewerId,
        reviewerUsername: reviewerUsers.username,
        assignedBy: moderationReviews.assignedBy,
        assignedByUsername: assignerUsers.username,
        status: moderationReviews.status,
        priority: moderationReviews.priority,
        category: moderationReviews.category,
        severity: moderationReviews.severity,
        decision: moderationReviews.decision,
        decisionReason: moderationReviews.decisionReason,
        internalNotes: moderationReviews.internalNotes,
        publicResponse: moderationReviews.publicResponse,
        estimatedReward: moderationReviews.estimatedReward,
        actualReward: moderationReviews.actualReward,
        reviewStarted: moderationReviews.reviewStarted,
        reviewCompleted: moderationReviews.reviewCompleted,
        dueDate: moderationReviews.dueDate,
        tags: moderationReviews.tags,
        createdAt: moderationReviews.createdAt,
        updatedAt: moderationReviews.updatedAt
      })
      .from(moderationReviews)
      .leftJoin(submissions, eq(moderationReviews.submissionId, submissions.id))
      .leftJoin(users, eq(submissions.userId, users.id))
      .leftJoin(reviewerUsers, eq(moderationReviews.reviewerId, reviewerUsers.id))
      .leftJoin(assignerUsers, eq(moderationReviews.assignedBy, assignerUsers.id))
      .orderBy(desc(moderationReviews.createdAt))
      .limit(limit)
      .offset(offset);

      const conditions = [];
      if (reviewerId) conditions.push(eq(moderationReviews.reviewerId, reviewerId));
      if (status) conditions.push(eq(moderationReviews.status, status));
      if (priority) conditions.push(eq(moderationReviews.priority, priority));
      if (category) conditions.push(eq(moderationReviews.category, category));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query;
    } catch (error) {
      console.error('Error getting moderation reviews:', error);
      return [];
    }
    }
    return [];
  },

  async getModerationReview(id: number) {
    if (db) {
    try {
      const [review] = await db.select({
        id: moderationReviews.id,
        submissionId: moderationReviews.submissionId,
        submissionTitle: submissions.title,
        submissionDescription: submissions.description,
        submissionType: submissions.type,
        submissionSeverity: submissions.severity,
        submissionStatus: submissions.status,
        submissionCreatedAt: submissions.createdAt,
        submissionUserId: submissions.userId,
        submissionUserUsername: users.username,
        reviewerId: moderationReviews.reviewerId,
        reviewerUsername: reviewerUsers.username,
        assignedBy: moderationReviews.assignedBy,
        assignedByUsername: assignerUsers.username,
        status: moderationReviews.status,
        priority: moderationReviews.priority,
        category: moderationReviews.category,
        severity: moderationReviews.severity,
        decision: moderationReviews.decision,
        decisionReason: moderationReviews.decisionReason,
        internalNotes: moderationReviews.internalNotes,
        publicResponse: moderationReviews.publicResponse,
        estimatedReward: moderationReviews.estimatedReward,
        actualReward: moderationReviews.actualReward,
        reviewStarted: moderationReviews.reviewStarted,
        reviewCompleted: moderationReviews.reviewCompleted,
        dueDate: moderationReviews.dueDate,
        tags: moderationReviews.tags,
        attachments: moderationReviews.attachments,
        createdAt: moderationReviews.createdAt,
        updatedAt: moderationReviews.updatedAt
      })
      .from(moderationReviews)
      .leftJoin(submissions, eq(moderationReviews.submissionId, submissions.id))
      .leftJoin(users, eq(submissions.userId, users.id))
      .leftJoin(reviewerUsers, eq(moderationReviews.reviewerId, reviewerUsers.id))
      .leftJoin(assignerUsers, eq(moderationReviews.assignedBy, assignerUsers.id))
      .where(eq(moderationReviews.id, id));

      return review;
    } catch (error) {
      console.error('Error getting moderation review:', error);
      return null;
    }
    }
    return null;
  },

  async createModerationReview(data: InsertModerationReview) {
    if (db) {
    try {
      const [review] = await db.insert(moderationReviews)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return review;
    } catch (error) {
      console.error('Error creating moderation review:', error);
      return null;
    }
    }
    return null;
  },

  async updateModerationReview(id: number, data: Partial<InsertModerationReview>) {
    if (db) {
    try {
      const [updated] = await db.update(moderationReviews)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(moderationReviews.id, id))        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating moderation review:', error);
      return null;
    }
    }
    return null;
  },

  async assignModerationReview(reviewId: number, reviewerId: number, assignedBy: number) {
    if (db) {
    try {
      const [updated] = await db.update(moderationReviews)
        .set({
          reviewerId,
          assignedBy,
          status: 'assigned',
          reviewStarted: new Date(),
          updatedAt: new Date()
        })
        .where(eq(moderationReviews.id, reviewId))
        .returning();

      // Update reviewer's assignment count
      const reviewer = await db.select().from(moderationTeam).where(eq(moderationTeam.userId, reviewerId));
      if (reviewer.length > 0) {
        await db.update(moderationTeam)
          .set({
            currentAssignments: (reviewer[0].currentAssignments || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(moderationTeam.userId, reviewerId));
      }

      return updated;
    } catch (error) {
      console.error('Error assigning moderation review:', error);
      return null;
    }
    }
    return null;
  },

  async getModerationComments(reviewId: number) {
    if (db) {
    try {
      return await db.select({
        id: moderationComments.id,
        reviewId: moderationComments.reviewId,
        authorId: moderationComments.authorId,
        authorUsername: users.username,
        content: moderationComments.content,
        commentType: moderationComments.commentType,
        isResolved: moderationComments.isResolved,
        resolvedBy: moderationComments.resolvedBy,
        resolvedAt: moderationComments.resolvedAt,
        mentions: moderationComments.mentions,
        attachments: moderationComments.attachments,
        createdAt: moderationComments.createdAt,
        updatedAt: moderationComments.updatedAt
      })
      .from(moderationComments)
      .leftJoin(users, eq(moderationComments.authorId, users.id))
      .where(eq(moderationComments.reviewId, reviewId))
      .orderBy(moderationComments.createdAt);
    } catch (error) {
      console.error('Error getting moderation comments:', error);
      return [];
    }
    }
    return [];
  },

  async createModerationComment(data: InsertModerationComment) {
    if (db) {
    try {
      const [comment] = await db.insert(moderationComments)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return comment;
    } catch (error) {
      console.error('Error creating moderation comment:', error);
      return null;
    }
    }
    return null;
  },

  async updateModerationComment(id: number, data: Partial<InsertModerationComment>) {
    if (db) {
    try {
      const [updated] = await db.update(moderationComments)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(moderationComments.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating moderation comment:', error);
      return null;
    }
    }
    return null;
  },

  async createModerationAuditLog(data: InsertModerationAuditLog) {
    if (db) {
    try {
      const [log] = await db.insert(moderationAuditLog)
        .values({
          ...data,
          createdAt: new Date()
        })
        .returning();
      return log;
    } catch (error) {
      console.error('Error creating moderation audit log:', error);
      return null;
    }
    }
    return null;
  },

// Get moderation audit logs
  async getModerationAuditLogs(reviewId?: number, submissionId?: number, limit: number = 50) {
    if (!db) return [];

    try {
      let query = db.select({
        id: moderationAuditLog.id,
        reviewId: moderationAuditLog.reviewId,
        submissionId: moderationAuditLog.submissionId,
        userId: moderationAuditLog.userId,
        username: users.username,
        action: moderationAuditLog.action,
        oldValue: moderationAuditLog.oldValue,
        newValue: moderationAuditLog.newValue,
        description: moderationAuditLog.description,
        metadata: moderationAuditLog.metadata,
        createdAt: moderationAuditLog.createdAt
      })
      .from(moderationAuditLog)
      .leftJoin(users, eq(moderationAuditLog.userId, users.id))
      .orderBy(desc(moderationAuditLog.createdAt))
      .limit(limit);

      if (reviewId) {
        query = query.where(eq(moderationAuditLog.reviewId, reviewId));
      } else if (submissionId) {
        query = query.where(eq(moderationAuditLog.submissionId, submissionId));
      }

      return await query;
    } catch (error) {
      console.error('Error getting moderation audit logs:', error);
      return [];
    }
  }

  // Cryptocurrency storage methods

  // Crypto Wallets
  ,async createCryptoWallet(walletData: InsertCryptoWallet) {
    if (db) {
    try {
      const [wallet] = await db.insert(cryptoWallets).values(walletData).returning();
      return wallet;
    } catch (error) {
      console.error('Error creating crypto wallet:', error);
      return null;
    }
    }
    return null;
  }

  ,async getCryptoWalletsByUser(userId: number) {
    if (db) {
    try {
      return await db.select().from(cryptoWallets)
        .where(eq(cryptoWallets.userId, userId))
        .orderBy(desc(cryptoWallets.createdAt));
    } catch (error) {
      console.error('Error getting user crypto wallets:', error);
      return [];
    }
    }
    return [];
  }

  ,async getCryptoWalletByAddress(walletAddress: string) {
    if (db) {
    try {
      const [wallet] = await db.select().from(cryptoWallets)
        .where(eq(cryptoWallets.walletAddress, walletAddress))
        .limit(1);
      return wallet || null;
    } catch (error) {
      console.error('Error getting crypto wallet by address:', error);
      return null;
    }
    }
    return null;
  }

  ,async updateCryptoWallet(walletId: number, updateData: Partial<CryptoWallet>) {
    if (db) {
    try {
      const [wallet] = await db.update(cryptoWallets)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(cryptoWallets.id, walletId))
        .returning();
      return wallet;
    } catch (error) {
      console.error('Error updating crypto wallet:', error);
      return null;
    }
    }
    return null;
  }

  // Crypto Payment Intents
  ,async createCryptoPaymentIntent(intentData: InsertCryptoPaymentIntent) {
    if (db) {
    try {
      const [intent] = await db.insert(cryptoPaymentIntents).values(intentData).returning();
      return intent;
    } catch (error) {
      console.error('Error creating crypto payment intent:', error);
      return null;
    }
    }
    return null;
  }

  ,async getCryptoPaymentIntentByMerchantOrderId(merchantOrderId: string) {
    if (db) {
    try {
      const [intent] = await db.select().from(cryptoPaymentIntents)
        .where(eq(cryptoPaymentIntents.merchantOrderId, merchantOrderId))
        .limit(1);
      return intent || null;
    } catch (error) {
      console.error('Error getting crypto payment intent:', error);
      return null;
    }
    }
    return null;
  }

  ,async updateCryptoPaymentIntent(intentId: number, updateData: Partial<CryptoPaymentIntent>) {
    if (db) {
    try {
      const [intent] = await db.update(cryptoPaymentIntents)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(cryptoPaymentIntents.id, intentId))
        .returning();
      return intent;
    } catch (error) {
      console.error('Error updating crypto payment intent:', error);
      return null;
    }
    }
    return null;
  }

  ,async getCryptoPaymentIntentsByCompany(companyId: number, limit: number = 50) {
    if (db) {
    try {
      return await db.select().from(cryptoPaymentIntents)
        .where(eq(cryptoPaymentIntents.companyId, companyId))
        .orderBy(desc(cryptoPaymentIntents.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting company crypto payment intents:', error);
      return [];
    }
    }
    return [];
  }

  // Crypto Withdrawals
  ,async createCryptoWithdrawal(withdrawalData: InsertCryptoWithdrawal) {
    if (db) {
    try {
      const [withdrawal] = await db.insert(cryptoWithdrawals).values(withdrawalData).returning();
      return withdrawal;
    } catch (error) {
      console.error('Error creating crypto withdrawal:', error);
      return null;
    }
    }
    return null;
  }

  ,async updateCryptoWithdrawal(withdrawalId: number, updateData: Partial<CryptoWithdrawal>) {
    if (db) {
    try {
      const [withdrawal] = await db.update(cryptoWithdrawals)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(cryptoWithdrawals.id, withdrawalId))
        .returning();
      return withdrawal;
    } catch (error) {
      console.error('Error updating crypto withdrawal:', error);
      return null;
    }
    }
    return null;
  }

  ,async getCryptoWithdrawalsByUser(userId: number, limit: number = 50) {
    if (db) {
    try {
      return await db.select().from(cryptoWithdrawals)
        .where(eq(cryptoWithdrawals.userId, userId))
        .orderBy(desc(cryptoWithdrawals.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting user crypto withdrawals:', error);
      return [];
    }
    }
    return [];
  }

  ,async getRecentCryptoWithdrawals(userId: number, hours: number = 24) {
    if (db) {
    try {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      return await db.select().from(cryptoWithdrawals)
        .where(
          and(
            eq(cryptoWithdrawals.userId, userId),
            gte(cryptoWithdrawals.createdAt, hoursAgo)
          )
        )
        .orderBy(desc(cryptoWithdrawals.createdAt));
    } catch (error) {
      console.error('Error getting recent crypto withdrawals:', error);
      return [];
    }
    }
    return [];
  }

  // Crypto Transactions
  ,async createCryptoTransaction(transactionData: InsertCryptoTransaction) {
    if (db) {
    try {
      const [transaction] = await db.insert(cryptoTransactions).values(transactionData).returning();
      return transaction;
    } catch (error) {
      console.error('Error creating crypto transaction:', error);
      return null;
    }
    }
    return null;
  }

  ,async getCryptoTransactionsByUser(userId: number, limit: number = 50) {
    if (db) {
    try {
      return await db.select().from(cryptoTransactions)
        .where(eq(cryptoTransactions.userId, userId))
        .orderBy(desc(cryptoTransactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting user crypto transactions:', error);
      return [];
    }
    }
    return [];
  }

  // Crypto Network Settings
  ,async createCryptoNetworkSettings(settingsData: InsertCryptoNetworkSettings) {
    if (db) {
    try {
      const [settings] = await db.insert(cryptoNetworkSettings).values(settingsData).returning();
      return settings;
    } catch (error) {
      console.error('Error creating crypto network settings:', error);
      return null;
    }
    }
    return null;
  }

  ,async getCryptoNetworkSettings() {
    if (db) {
    try {
      return await db.select().from(cryptoNetworkSettings)
        .where(eq(cryptoNetworkSettings.isActive, true))
        .orderBy(cryptoNetworkSettings.displayName);
    } catch (error) {
      console.error('Error getting crypto network settings:', error);
      return [];
    }
    }
    return [];
  }

  // Crypto Statistics
  ,async getCryptoStatistics() {
    if (db) {
    try {
      const [paymentStats] = await db.select({
        totalPayments: count(cryptoPaymentIntents.id),
        totalPaymentVolume: sum(cryptoPaymentIntents.amount)
      }).from(cryptoPaymentIntents)
        .where(eq(cryptoPaymentIntents.status, 'completed'));

      const [withdrawalStats] = await db.select({
        totalWithdrawals: count(cryptoWithdrawals.id),
        totalWithdrawalVolume: sum(cryptoWithdrawals.amount),
        pendingWithdrawals: count(cryptoWithdrawals.id)
      }).from(cryptoWithdrawals)
        .where(eq(cryptoWithdrawals.status, 'pending'));

      return {
        totalPayments: paymentStats?.totalPayments || 0,
        totalPaymentVolume: paymentStats?.totalPaymentVolume || 0,
        totalWithdrawals: withdrawalStats?.totalWithdrawals || 0,
        totalWithdrawalVolume: withdrawalStats?.totalWithdrawalVolume || 0,
        pendingWithdrawals: withdrawalStats?.pendingWithdrawals || 0,
        totalVolume: (paymentStats?.totalPaymentVolume || 0) + (withdrawalStats?.totalWithdrawalVolume || 0)
      };
    } catch (error) {
      console.error('Error getting crypto statistics:', error);
      return {};
    }
    }
    return {};
  }
   ,async getUserByUsername(username: string) {
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
  }
  ,async updateTriageAnalystWorkload(analystId: number, workload: number) {
    if (db) {
      try {
        const [analyst] = await db
          .update(triageAnalysts)
          .set({ currentWorkload: workload, updatedAt: new Date() })
          .where(eq(triageAnalysts.id, analystId))
          .returning();
        return analyst;
      } catch (error) {
        console.error('Error updating triage analyst workload:', error);
        return null;
      }
    }
    return null;
  }
   // Admin-specific methods
   ,async getUserCount() {
    if (db) {
    try {
      const [{ value }] = await db.select({ value: count() }).from(users);
      return value;
    } catch (error) {
      console.error("Error getting user count:", error);
      return 0;
    }
    }
    return 0;
  }

  ,async getActiveProgramsCount() {
    if (db) {
    try {
      const [{ value }] = await db.select({ value: count() })
        .from(programs)
        .where(eq(programs.status, 'active'));
      return value;
    } catch (error) {
      console.error("Error getting active programs count:", error);
      return 0;
    }
    }
    return 0;
  }

  ,async getSubmissionsCount() {
    if (db) {
    try {
      const [{ value }] = await db.select({ value: count() }).from(submissions);
      return value;
    } catch (error) {
      console.error("Error getting submissions count:", error);
      return 0;
    }
    }
    return 0;
  }

  ,async getPendingReviewsCount() {
    if (db) {
    try {
      // If moderation reviews table exists
      const [{ value }] = await db.select({ value: count() })
        .from(moderationReviews)
        .where(eq(moderationReviews.status, 'pending'));
      return value;
    } catch (error) {
      console.error("Error getting pending reviews count:", error);
      return 0;
    }
    }
    return 0;
  }

  ,async getAllUsers() {
    if (db) {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      return allUsers;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
    }
    return [];
  }

  // Crypto Payment Approval Methods
  ,async createCryptoPaymentApproval(data: InsertCryptoPaymentApproval) {
    if (db) {
      try {
        const [approval] = await db.insert(cryptoPaymentApprovals).values(data).returning();
        return approval;
      } catch (error) {
        console.error('Error creating crypto payment approval:', error);
        return null;
      }
    }
    return null;
  }

  ,async getPendingCryptoPaymentApprovals() {
    if (db) {
      try {
        const approvals = await db
          .select({
            id: cryptoPaymentApprovals.id,
            paymentMemo: cryptoPaymentApprovals.paymentMemo,
            amount: cryptoPaymentApprovals.amount,
            currency: cryptoPaymentApprovals.currency,
            status: cryptoPaymentApprovals.status,
            createdAt: cryptoPaymentApprovals.createdAt,
            companyName: users.companyName,
            username: users.username,
            cryptoPaymentIntentId: cryptoPaymentApprovals.cryptoPaymentIntentId
          })
          .from(cryptoPaymentApprovals)
          .leftJoin(users, eq(cryptoPaymentApprovals.companyId, users.id))
          .where(eq(cryptoPaymentApprovals.status, 'pending'))
          .orderBy(desc(cryptoPaymentApprovals.createdAt));
        return approvals;
      } catch (error) {
        console.error('Error getting pending crypto payment approvals:', error);
        return [];
      }
    }
    return [];
  }

  ,async approveCryptoPayment(approvalId: number, adminId: number, adminNotes?: string) {
    if (db) {
      try {
        const [approval] = await db
          .update(cryptoPaymentApprovals)
          .set({
            status: 'approved',
            adminId: adminId,
            adminNotes: adminNotes,
            approvedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(cryptoPaymentApprovals.id, approvalId))
          .returning();
        return approval;
      } catch (error) {
        console.error('Error approving crypto payment:', error);
        return null;
      }
    }
    return null;
  }

  ,async rejectCryptoPayment(approvalId: number, adminId: number, adminNotes?: string) {
    if (db) {
      try {
        const [approval] = await db
          .update(cryptoPaymentApprovals)
          .set({
            status: 'rejected',
            adminId: adminId,
            adminNotes: adminNotes,
            rejectedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(cryptoPaymentApprovals.id, approvalId))
          .returning();
        return approval;
      } catch (error) {
        console.error('Error rejecting crypto payment:', error);
        return null;
      }
    }
    return null;
  }

  ,async getCryptoPaymentApprovalById(approvalId: number) {
    if (db) {
      try {
        const [approval] = await db
          .select({
            id: cryptoPaymentApprovals.id,
            paymentMemo: cryptoPaymentApprovals.paymentMemo,
            amount: cryptoPaymentApprovals.amount,
            currency: cryptoPaymentApprovals.currency,
            status: cryptoPaymentApprovals.status,
            adminNotes: cryptoPaymentApprovals.adminNotes,
            createdAt: cryptoPaymentApprovals.createdAt,
            approvedAt: cryptoPaymentApprovals.approvedAt,
            rejectedAt: cryptoPaymentApprovals.rejectedAt,
            companyName: users.companyName,
            username: users.username,
            cryptoPaymentIntentId: cryptoPaymentApprovals.cryptoPaymentIntentId
          })
          .from(cryptoPaymentApprovals)
          .leftJoin(users, eq(cryptoPaymentApprovals.companyId, users.id))
          .where(eq(cryptoPaymentApprovals.id, approvalId));
        return approval;
      } catch (error) {
        console.error('Error getting crypto payment approval:', error);
        return null;
      }
    }
    return null;
  }

  // User verification methods
  ,async updateUserVerificationStatus(userId: number, verificationStatus: string) {
    if (db) {
      try {
        const [user] = await db
          .update(users)
          .set({ verificationStatus, updatedAt: new Date() })
          .where(eq(users.id, userId))
          .returning();

        console.log(`Updated user ${userId} verification status to ${verificationStatus}`);
        return user;
      } catch (error) {
        console.error('Error updating user verification status:', error);
        return null;
      }
    }
    return null;
  }

  ,async getCompanyUsers() {
    if (db) {
      try {
        const companyUsers = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
            companyName: users.companyName,
            verificationStatus: users.verificationStatus,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
          })
          .from(users)
          .where(eq(users.userType, 'company'))
          .orderBy(desc(users.createdAt));
        return companyUsers;
      } catch (error) {
        console.error('Error getting company users:', error);
        return [];
      }
    }
    return [];
  }
  ,async getProgram(id: number){
    if(db){
      try {
        const result = await db.select().from(programs).where(eq(programs.id, id))
        return result[0] || null
      } catch (error) {
        console.log("Error getting program", error)
        return null
      }
    }
    return memoryStorage.programs.get(id) || null
  }

  async getAllPrograms() {
    if(db){
      try{
        return db.select().from(programs)
      }catch(error){
        console.log("Error getting all programs", error)
        return []
      }
    }
    return Array.from(memoryStorage.programs.values());
  }
};