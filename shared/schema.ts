import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  userType: text("user_type").default("hacker"), // "hacker" or "company"
  companyName: text("company_name"), // Only for company users
  companyWebsite: text("company_website"), // Only for company users
  companySize: text("company_size"), // Only for company users
  companyIndustry: text("company_industry"), // Only for company users
  isEmailVerified: boolean("is_email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  reputation: integer("reputation").default(0),
  rank: text("rank").default("Newbie"),
  createdAt: timestamp("created_at").defaultNow()
});

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
  .refine(pwd => !(/(.)\1{2,}/.test(pwd)), "Password cannot contain repeating characters (e.g., 'aaa')")
  .refine(pwd => !/password|123456|qwerty/i.test(pwd), "Password contains common patterns");

export const insertUserSchema = createInsertSchema(users, {
  password: z.string()
}).extend({
  password: passwordSchema,
  email: z.string().email("Invalid email address"),
  userType: z.enum(["hacker", "company"]),
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional(),
  companySize: z.string().optional(),
  companyIndustry: z.string().optional()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Programs Schema (Bug Bounty Programs)
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  logo: text("logo"), // text field for logo identifier/code
  rewardsRange: text("rewards_range").notNull(),
  status: text("status").default("active"),
  scope: jsonb("scope").notNull(), // Array of scope items like "Web", "Mobile", etc.
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertProgramSchema = createInsertSchema(programs).pick({
  name: true,
  description: true,
  company: true,
  logo: true,
  rewardsRange: true,
  status: true,
  scope: true,
  isPrivate: true
});

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

// Bug Submissions Schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // e.g. XSS, SQL Injection, CSRF
  severity: text("severity").notNull(), // Critical, High, Medium, Low, Info
  status: text("status").default("pending"), // pending, accepted, rejected, fixed
  userId: integer("user_id").notNull().references(() => users.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  reward: integer("reward"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  title: true,
  description: true,
  type: true,
  severity: true,
  programId: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Activity Schema (for user dashboard)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // submission_accepted, submission_pending, achievement_unlocked
  message: text("message").notNull(),
  details: text("details"),
  userId: integer("user_id").notNull().references(() => users.id),
  relatedId: integer("related_id"), // Could be submission ID or program ID
  createdAt: timestamp("created_at").defaultNow()
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  message: true,
  details: true,
  userId: true,
  relatedId: true
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Notifications Schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // new_submission, status_change, achievement, system
  message: text("message").notNull(),
  link: text("link"), // Optional link to direct the user (e.g., /submissions/123)
  isRead: boolean("is_read").default(false),
  userId: integer("user_id").notNull().references(() => users.id),
  relatedId: integer("related_id"), // Could be submission ID or program ID
  createdAt: timestamp("created_at").defaultNow()
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  type: true,
  message: true,
  link: true,
  userId: true,
  relatedId: true
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Wallet table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Wallet = typeof wallets.$inferSelect;

// Transaction History table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  type: text("type").notNull(), // bounty, withdrawal, adjustment
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
  submissionId: integer("submission_id").references(() => submissions.id),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  walletId: true,
  type: true,
  amount: true,
  description: true,
  submissionId: true,
});

export type Transaction = typeof transactions.$inferSelect;

// Withdrawal Requests table
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // PayPal, Wise, Crypto, etc.
  destination: text("destination").notNull(), // PayPal email, wallet address, etc.
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).pick({
  walletId: true,
  amount: true,
  method: true,
  destination: true,
  notes: true,
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

// Company Wallets table
export const companyWallets = pgTable("company_wallets", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  balance: integer("balance").notNull().default(0),
  totalPaid: integer("total_paid").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow()
});

export const insertCompanyWalletSchema = createInsertSchema(companyWallets).pick({
  companyId: true,
  balance: true,
  totalPaid: true
});

export type CompanyWallet = typeof companyWallets.$inferSelect;
export type InsertCompanyWallet = z.infer<typeof insertCompanyWalletSchema>;

// Company Transactions table
export const companyTransactions = pgTable("company_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // manual, automated
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertCompanyTransactionSchema = createInsertSchema(companyTransactions).pick({
  companyId: true,
  amount: true,
  type: true,
  note: true
});

export type CompanyTransaction = typeof companyTransactions.$inferSelect;
export type InsertCompanyTransaction = z.infer<typeof insertCompanyTransactionSchema>;

// Payment Methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // PayPal, Stripe, Wise, etc.
  type: text("type").notNull(), // bank_transfer, digital_wallet, crypto
  isActive: boolean("is_active").default(true),
  supportedCurrencies: jsonb("supported_currencies").notNull(),
  processingFee: integer("processing_fee").default(0), // in basis points (100 = 1%)
  createdAt: timestamp("created_at").defaultNow()
});

// Escrow Accounts table
export const escrowAccounts = pgTable("escrow_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  submissionId: integer("submission_id").references(() => submissions.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, held, released, refunded
  platformCommission: integer("platform_commission").notNull(), // in cents
  researcherPayout: integer("researcher_payout").notNull(), // in cents
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Payment Intents table (for handling payments from companies)
export const paymentIntents = pgTable("payment_intents", {
  id: serial("id").primaryKey(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  companyId: integer("company_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, succeeded, failed, canceled
  purpose: text("purpose").notNull(), // wallet_topup, bounty_payment, subscription
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Payouts table (for payments to researchers)
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  submissionId: integer("submission_id").references(() => submissions.id),
  escrowAccountId: integer("escrow_account_id").references(() => escrowAccounts.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  paymentMethodId: integer("payment_method_id").notNull().references(() => paymentMethods.id),
  paymentMethodDetails: jsonb("payment_method_details"), // email, wallet address, etc.
  status: text("status").default("pending"), // pending, processing, completed, failed, cancelled
  externalTransactionId: text("external_transaction_id"), // PayPal, Stripe, etc. transaction ID
  failureReason: text("failure_reason"),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Commission Records table
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  totalAmount: integer("total_amount").notNull(), // total bounty in cents
  commissionRate: integer("commission_rate").notNull(), // in basis points (1500 = 15%)
  commissionAmount: integer("commission_amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, collected, refunded
  createdAt: timestamp("created_at").defaultNow()
});

// Transaction Logs table (for audit trail)
export const transactionLogs = pgTable("transaction_logs", {
  id: serial("id").primaryKey(),
  transactionType: text("transaction_type").notNull(), // payment_intent, escrow, payout, commission
  transactionId: integer("transaction_id").notNull(), // references various transaction tables
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // created, updated, completed, failed, cancelled
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});

// Payment Disputes table
export const paymentDisputes = pgTable("payment_disputes", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  disputedBy: integer("disputed_by").notNull().references(() => users.id), // researcher or company
  disputeType: text("dispute_type").notNull(), // payment_amount, payment_delay, invalid_bounty
  description: text("description").notNull(),
  status: text("status").default("open"), // open, under_review, resolved, rejected
  resolution: text("resolution"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Rate Limiting table for fraud prevention
export const paymentRateLimits = pgTable("payment_rate_limits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  actionType: text("action_type").notNull(), // payment_intent, payout_request, dispute
  attemptCount: integer("attempt_count").default(1),
  windowStart: timestamp("window_start").defaultNow(),
  blockedUntil: timestamp("blocked_until")
});

// Schema validators
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  name: true,
  type: true,
  isActive: true,
  supportedCurrencies: true,
  processingFee: true
});

export const insertEscrowAccountSchema = createInsertSchema(escrowAccounts).pick({
  companyId: true,
  submissionId: true,
  amount: true,
  currency: true,
  platformCommission: true,
  researcherPayout: true,
  expiresAt: true
});

export const insertPaymentIntentSchema = createInsertSchema(paymentIntents).pick({
  companyId: true,
  amount: true,
  currency: true,
  purpose: true,
  metadata: true
});

export const insertPayoutSchema = createInsertSchema(payouts).pick({
  userId: true,
  submissionId: true,
  escrowAccountId: true,
  amount: true,
  currency: true,
  paymentMethodId: true,
  paymentMethodDetails: true,
  scheduledFor: true
});

export const insertCommissionSchema = createInsertSchema(commissions).pick({
  submissionId: true,
  totalAmount: true,
  commissionRate: true,
  commissionAmount: true,
  currency: true
});

export const insertPaymentDisputeSchema = createInsertSchema(paymentDisputes).pick({
  submissionId: true,
  disputedBy: true,
  disputeType: true,
  description: true
});

// Type exports
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type EscrowAccount = typeof escrowAccounts.$inferSelect;
export type InsertEscrowAccount = z.infer<typeof insertEscrowAccountSchema>;

export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type InsertPaymentIntent = z.infer<typeof insertPaymentIntentSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;

export type TransactionLog = typeof transactionLogs.$inferSelect;
export type PaymentDispute = typeof paymentDisputes.$inferSelect;
export type InsertPaymentDispute = z.infer<typeof insertPaymentDisputeSchema>;