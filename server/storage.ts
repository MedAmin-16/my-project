import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, programs, submissions, activities, notifications, wallets, transactions, type User, type InsertUser, type Program, type InsertProgram, type Submission, type InsertSubmission, type Activity, type InsertActivity, type Notification, type InsertNotification, type Wallet, type Transaction, type InsertTransaction, type Withdrawal, type InsertWithdrawal, type CompanyWallet, type InsertCompanyWallet, type CompanyTransaction, type InsertCompanyTransaction, companyWallets, companyTransactions, paymentMethods, escrowAccounts, paymentIntents, payouts, commissions, transactionLogs, paymentDisputes, paymentRateLimits, type PaymentMethod, type InsertPaymentMethod, type EscrowAccount, type InsertEscrowAccount, type PaymentIntent, type InsertPaymentIntent, type Payout, type InsertPayout, type Commission, type InsertCommission, type TransactionLog, type PaymentDispute, type InsertPaymentDispute } from '@shared/schema';
import { and, eq, desc, sql } from "drizzle-orm";
import createMemoryStore from "memorystore";
import session from "express-session";
import { encrypt, decrypt } from "./crypto-utils";

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
                totalPaid: 0
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
        let query = db.select({
          totalCommissions: sql<number>`sum(${commissions.commissionAmount})`,
          count: sql<number>`count(*)`
        }).from(commissions).where(eq(commissions.status, 'collected'));

        // Add date filters if provided
        if (startDate && endDate) {
          query = query.where(
            and(
              eq(commissions.status, 'collected'),
              sql`${commissions.createdAt} >= ${startDate}`,
              sql`${commissions.createdAt} <= ${endDate}`
            )
          );
        }

        const [result] = await query;
        return result;
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
        
        const [existing] = await db.select()
          .from(paymentRateLimits)
          .where(
            and(
              userId ? eq(paymentRateLimits.userId, userId) : eq(paymentRateLimits.ipAddress, ipAddress),
              eq(paymentRateLimits.actionType, actionType),
              sql`${paymentRateLimits.windowStart} > ${windowStart}`
            )
          );

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
        const dateFilter = startDate && endDate 
          ? sql`created_at >= ${startDate} AND created_at <= ${endDate}`
          : sql`created_at >= NOW() - INTERVAL '30 days'`;

        const totalPayments = await db.select({
          count: sql<number>`count(*)`,
          total: sql<number>`sum(amount)`
        }).from(paymentIntents).where(
          and(
            eq(paymentIntents.status, 'succeeded'),
            sql`${dateFilter}`
          )
        );

        const totalPayouts = await db.select({
          count: sql<number>`count(*)`,
          total: sql<number>`sum(amount)`
        }).from(payouts).where(
          and(
            eq(payouts.status, 'completed'),
            sql`${dateFilter}`
          )
        );

        const pendingEscrow = await db.select({
          count: sql<number>`count(*)`,
          total: sql<number>`sum(amount)`
        }).from(escrowAccounts).where(eq(escrowAccounts.status, 'held'));

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
  }
};