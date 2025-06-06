import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, programs, submissions, activities, notifications, wallets, transactions, type User, type InsertUser, type Program, type InsertProgram, type Submission, type InsertSubmission, type Activity, type InsertActivity, type Notification, type InsertNotification, type Wallet, type Transaction, type InsertTransaction, type Withdrawal, type InsertWithdrawal, type CompanyWallet, type InsertCompanyWallet, type CompanyTransaction, type InsertCompanyTransaction, companyWallets, companyTransactions } from '@shared/schema';
import { eq, sql, desc } from 'drizzle-orm';
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
  }
};