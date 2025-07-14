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

// Public Chat Schema
export const publicMessages = pgTable("public_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  messageType: text("message_type").default("message"), // "message" or "announcement"
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPublicMessageSchema = createInsertSchema(publicMessages).pick({
  content: true,
  messageType: true
});

export type PublicMessage = typeof publicMessages.$inferSelect;
export type InsertPublicMessage = z.infer<typeof insertPublicMessageSchema>;

// Triage Service Tables
export const triageServices = pgTable("triage_services", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  serviceName: text("service_name").notNull().default("Managed Vulnerability Triage"),
  serviceType: text("service_type").notNull().default("managed_triage"), // managed_triage, consultation, remediation
  pricingModel: text("pricing_model").notNull().default("per_report"), // per_report, monthly, annual
  pricePerReport: integer("price_per_report").default(5000), // in cents ($50)
  monthlyPrice: integer("monthly_price").default(50000), // in cents ($500)
  annualPrice: integer("annual_price").default(500000), // in cents ($5000)
  isActive: boolean("is_active").default(true),
  autoAssignTriage: boolean("auto_assign_triage").default(true),
  triageLevel: text("triage_level").default("standard"), // basic, standard, premium
  includedServices: jsonb("included_services").default([]), // Array of service features
  maxReportsPerMonth: integer("max_reports_per_month").default(50),
  responseTimeHours: integer("response_time_hours").default(24),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const triageReports = pgTable("triage_reports", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  triageServiceId: integer("triage_service_id").notNull().references(() => triageServices.id),
  companyId: integer("company_id").notNull().references(() => users.id),
  triageAnalystId: integer("triage_analyst_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, escalated
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  severity: text("severity").notNull().default("unknown"), // SV1, SV2, SV3, SV4, unknown
  validationStatus: text("validation_status").default("pending"), // pending, validated, rejected, duplicate
  triageNotes: text("triage_notes"),
  technicalAssessment: text("technical_assessment"),
  businessImpact: text("business_impact"),
  recommendedActions: text("recommended_actions"),
  estimatedFixTime: text("estimated_fix_time"),
  cveReference: text("cve_reference"),
  isEscalated: boolean("is_escalated").default(false),
  escalationReason: text("escalation_reason"),
  communicationHistory: jsonb("communication_history").default([]),
  triageStartedAt: timestamp("triage_started_at"),
  triageCompletedAt: timestamp("triage_completed_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const triageCommunications = pgTable("triage_communications", {
  id: serial("id").primaryKey(),
  triageReportId: integer("triage_report_id").notNull().references(() => triageReports.id),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  messageType: text("message_type").notNull().default("message"), // message, status_update, question, clarification
  subject: text("subject"),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false), // Internal platform notes vs external communication
  attachments: jsonb("attachments").default([]),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const triageSubscriptions = pgTable("triage_subscriptions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  triageServiceId: integer("triage_service_id").notNull().references(() => triageServices.id),
  subscriptionType: text("subscription_type").notNull().default("monthly"), // monthly, annual, per_report
  status: text("status").notNull().default("active"), // active, paused, cancelled, expired
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  reportsProcessed: integer("reports_processed").default(0),
  totalCost: integer("total_cost").default(0), // in cents
  lastBillingDate: timestamp("last_billing_date"),
  nextBillingDate: timestamp("next_billing_date"),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const triageAnalysts = pgTable("triage_analysts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specializations: jsonb("specializations").default([]), // Array of expertise areas
  currentWorkload: integer("current_workload").default(0),
  maxWorkload: integer("max_workload").default(10),
  availabilityStatus: text("availability_status").default("available"), // available, busy, offline
  hourlyRate: integer("hourly_rate").default(10000), // in cents ($100)
  performanceRating: integer("performance_rating").default(5), // 1-5 scale
  totalReportsHandled: integer("total_reports_handled").default(0),
  avgResponseTime: integer("avg_response_time").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Insert schemas for triage tables
export const insertTriageServiceSchema = createInsertSchema(triageServices).pick({
  companyId: true,
  serviceName: true,
  serviceType: true,
  pricingModel: true,
  pricePerReport: true,
  monthlyPrice: true,
  annualPrice: true,
  triageLevel: true,
  includedServices: true,
  maxReportsPerMonth: true,
  responseTimeHours: true
});

export const insertTriageReportSchema = createInsertSchema(triageReports).pick({
  submissionId: true,
  triageServiceId: true,
  companyId: true,
  triageAnalystId: true,
  status: true,
  priority: true,
  severity: true,
  validationStatus: true,
  triageNotes: true,
  technicalAssessment: true,
  businessImpact: true,
  recommendedActions: true,
  estimatedFixTime: true,
  cveReference: true,
  escalationReason: true,
  dueDate: true
});

export const insertTriageCommunicationSchema = createInsertSchema(triageCommunications).pick({
  triageReportId: true,
  fromUserId: true,
  toUserId: true,
  messageType: true,
  subject: true,
  message: true,
  isInternal: true,
  attachments: true
});

export const insertTriageSubscriptionSchema = createInsertSchema(triageSubscriptions).pick({
  companyId: true,
  triageServiceId: true,
  subscriptionType: true,
  startDate: true,
  endDate: true,
  autoRenew: true,
  paymentMethodId: true
});

export const insertTriageAnalystSchema = createInsertSchema(triageAnalysts).pick({
  userId: true,
  specializations: true,
  maxWorkload: true,
  hourlyRate: true
});

// Type exports for triage
export type TriageService = typeof triageServices.$inferSelect;
export type InsertTriageService = z.infer<typeof insertTriageServiceSchema>;

export type TriageReport = typeof triageReports.$inferSelect;
export type InsertTriageReport = z.infer<typeof insertTriageReportSchema>;

export type TriageCommunication = typeof triageCommunications.$inferSelect;
export type InsertTriageCommunication = z.infer<typeof insertTriageCommunicationSchema>;

export type TriageSubscription = typeof triageSubscriptions.$inferSelect;
export type InsertTriageSubscription = z.infer<typeof insertTriageSubscriptionSchema>;

export type TriageAnalyst = typeof triageAnalysts.$inferSelect;
export type InsertTriageAnalyst = z.infer<typeof insertTriageAnalystSchema>;

// Moderation System Tables
export const moderationTeam = pgTable("moderation_team", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("reviewer"), // admin, analyst, reviewer
  department: text("department").default("security"), // security, compliance, technical
  permissions: jsonb("permissions").default([]), // Array of permission strings
  isActive: boolean("is_active").default(true),
  specializations: jsonb("specializations").default([]), // Array of expertise areas
  maxAssignments: integer("max_assignments").default(10),
  currentAssignments: integer("current_assignments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const moderationReviews = pgTable("moderation_reviews", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  assignedBy: integer("assigned_by").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, in_review, approved, rejected, needs_info
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  category: text("category").default("vulnerability"), // vulnerability, duplicate, spam, invalid
  severity: text("severity").default("unknown"), // critical, high, medium, low, info
  decision: text("decision"), // accept, reject, duplicate, invalid, needs_clarification
  decisionReason: text("decision_reason"),
  internalNotes: text("internal_notes"),
  publicResponse: text("public_response"),
  estimatedReward: integer("estimated_reward"), // in cents
  actualReward: integer("actual_reward"), // in cents
  reviewStarted: timestamp("review_started"),
  reviewCompleted: timestamp("review_completed"),
  dueDate: timestamp("due_date"),
  tags: jsonb("tags").default([]), // Array of tags for categorization
  attachments: jsonb("attachments").default([]), // Array of file attachments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const moderationComments = pgTable("moderation_comments", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull().references(() => moderationReviews.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  commentType: text("comment_type").default("internal"), // internal, external, system
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  mentions: jsonb("mentions").default([]), // Array of user IDs mentioned
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const moderationAuditLog = pgTable("moderation_audit_log", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => moderationReviews.id),
  submissionId: integer("submission_id").references(() => submissions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // assigned, status_changed, comment_added, decision_made
  oldValue: text("old_value"),
  newValue: text("new_value"),
  description: text("description"),
  metadata: jsonb("metadata").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});

export const moderationWorkflow = pgTable("moderation_workflow", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(), // Array of workflow steps
  triggerConditions: jsonb("trigger_conditions").default([]),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const moderationNotifications = pgTable("moderation_notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  senderId: integer("sender_id").references(() => users.id),
  reviewId: integer("review_id").references(() => moderationReviews.id),
  type: text("type").notNull(), // assignment, status_change, comment, deadline, mention
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: text("action_url"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas for moderation system
export const insertModerationTeamSchema = createInsertSchema(moderationTeam).pick({
  userId: true,
  role: true,
  department: true,
  permissions: true,
  specializations: true,
  maxAssignments: true
});

export const insertModerationReviewSchema = createInsertSchema(moderationReviews).pick({
  submissionId: true,
  reviewerId: true,
  assignedBy: true,
  status: true,
  priority: true,
  category: true,
  severity: true,
  decision: true,
  decisionReason: true,
  internalNotes: true,
  publicResponse: true,
  estimatedReward: true,
  dueDate: true,
  tags: true
});

export const insertModerationCommentSchema = createInsertSchema(moderationComments).pick({
  reviewId: true,
  authorId: true,
  content: true,
  commentType: true,
  mentions: true,
  attachments: true
});

export const insertModerationAuditLogSchema = createInsertSchema(moderationAuditLog).pick({
  reviewId: true,
  submissionId: true,
  userId: true,
  action: true,
  oldValue: true,
  newValue: true,
  description: true,
  metadata: true,
  ipAddress: true,
  userAgent: true
});

export const insertModerationNotificationSchema = createInsertSchema(moderationNotifications).pick({
  recipientId: true,
  senderId: true,
  reviewId: true,
  type: true,
  title: true,
  message: true,
  priority: true,
  actionUrl: true,
  metadata: true
});

// Type exports for moderation system
export type ModerationTeam = typeof moderationTeam.$inferSelect;
export type InsertModerationTeam = z.infer<typeof insertModerationTeamSchema>;

export type ModerationReview = typeof moderationReviews.$inferSelect;
export type InsertModerationReview = z.infer<typeof insertModerationReviewSchema>;

export type ModerationComment = typeof moderationComments.$inferSelect;
export type InsertModerationComment = z.infer<typeof insertModerationCommentSchema>;

export type ModerationAuditLog = typeof moderationAuditLog.$inferSelect;
export type InsertModerationAuditLog = z.infer<typeof insertModerationAuditLogSchema>;

export type ModerationNotification = typeof moderationNotifications.$inferSelect;
export type InsertModerationNotification = z.infer<typeof insertModerationNotificationSchema>;

// Cryptocurrency Payment Tables
export const cryptoWallets = pgTable("crypto_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletType: text("wallet_type").notNull(), // binance, metamask, trust_wallet, etc.
  walletAddress: text("wallet_address").notNull(), // encrypted
  network: text("network").notNull(), // bitcoin, ethereum, bsc, tron, etc.
  isVerified: boolean("is_verified").default(false),
  verificationCode: text("verification_code"),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const cryptoPaymentIntents = pgTable("crypto_payment_intents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USDT"), // USDT, BTC, ETH, BNB, etc.
  purpose: text("purpose").notNull(), // wallet_topup, bounty_payment, subscription
  status: text("status").default("pending"), // pending, completed, failed, expired
  provider: text("provider").notNull().default("binance_pay"), // binance_pay, coinbase, etc.
  providerOrderId: text("provider_order_id").unique(),
  merchantOrderId: text("merchant_order_id").unique(),
  transactionId: text("transaction_id"), // blockchain transaction ID
  metadata: jsonb("metadata"), // provider-specific data
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const cryptoWithdrawals = pgTable("crypto_withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull(), // USDT, BTC, ETH, BNB, etc.
  walletAddress: text("wallet_address").notNull(), // encrypted destination address
  network: text("network").notNull(), // bitcoin, ethereum, bsc, tron, etc.
  status: text("status").default("pending"), // pending, processing, completed, failed, cancelled
  provider: text("provider").notNull().default("binance_pay"),
  transactionId: text("transaction_id"), // blockchain transaction ID
  providerWithdrawalId: text("provider_withdrawal_id"), // provider's withdrawal ID
  networkFee: integer("network_fee").default(0), // network fee in cents
  failureReason: text("failure_reason"),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const cryptoTransactions = pgTable("crypto_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => users.id),
  transactionType: text("transaction_type").notNull(), // payment_in, withdrawal_out, fee, commission
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  networkFee: integer("network_fee").default(0),
  confirmations: integer("confirmations").default(0),
  requiredConfirmations: integer("required_confirmations").default(1),
  status: text("status").default("pending"), // pending, confirmed, failed
  relatedPaymentIntentId: integer("related_payment_intent_id").references(() => cryptoPaymentIntents.id),
  relatedWithdrawalId: integer("related_withdrawal_id").references(() => cryptoWithdrawals.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const cryptoWalletVerifications = pgTable("crypto_wallet_verifications", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => cryptoWallets.id),
  verificationMethod: text("verification_method").notNull(), // signature, micro_transaction, message_signing
  verificationData: text("verification_data"), // signature, transaction hash, etc.
  status: text("status").default("pending"), // pending, verified, failed
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  expiresAt: timestamp("expires_at"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const cryptoNetworkSettings = pgTable("crypto_network_settings", {
  id: serial("id").primaryKey(),
  network: text("network").notNull().unique(), // bitcoin, ethereum, bsc, tron, etc.
  displayName: text("display_name").notNull(),
  currency: text("currency").notNull(), // BTC, ETH, BNB, TRX, etc.
  isActive: boolean("is_active").default(true),
  minWithdrawal: integer("min_withdrawal").notNull(), // minimum withdrawal in cents
  maxWithdrawal: integer("max_withdrawal").notNull(), // maximum withdrawal in cents
  networkFee: integer("network_fee").notNull(), // standard network fee in cents
  confirmationsRequired: integer("confirmations_required").default(1),
  processingTimeMinutes: integer("processing_time_minutes").default(30),
  metadata: jsonb("metadata"), // network-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Insert schemas for crypto tables
export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).pick({
  userId: true,
  walletType: true,
  walletAddress: true,
  network: true,
  isVerified: true
});

export const insertCryptoPaymentIntentSchema = createInsertSchema(cryptoPaymentIntents).pick({
  companyId: true,
  amount: true,
  currency: true,
  purpose: true,
  provider: true,
  providerOrderId: true,
  merchantOrderId: true,
  metadata: true
});

export const insertCryptoWithdrawalSchema = createInsertSchema(cryptoWithdrawals).pick({
  userId: true,
  amount: true,
  currency: true,
  walletAddress: true,
  network: true,
  provider: true,
  scheduledFor: true
});

export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).pick({
  userId: true,
  companyId: true,
  transactionType: true,
  amount: true,
  currency: true,
  fromAddress: true,
  toAddress: true,
  transactionHash: true,
  networkFee: true,
  relatedPaymentIntentId: true,
  relatedWithdrawalId: true,
  metadata: true
});

export const insertCryptoNetworkSettingsSchema = createInsertSchema(cryptoNetworkSettings).pick({
  network: true,
  displayName: true,
  currency: true,
  isActive: true,
  minWithdrawal: true,
  maxWithdrawal: true,
  networkFee: true,
  confirmationsRequired: true,
  processingTimeMinutes: true,
  metadata: true
});

// Type exports for crypto system
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;

export type CryptoPaymentIntent = typeof cryptoPaymentIntents.$inferSelect;
export type InsertCryptoPaymentIntent = z.infer<typeof insertCryptoPaymentIntentSchema>;

export type CryptoWithdrawal = typeof cryptoWithdrawals.$inferSelect;
export type InsertCryptoWithdrawal = z.infer<typeof insertCryptoWithdrawalSchema>;

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;

export type CryptoNetworkSettings = typeof cryptoNetworkSettings.$inferSelect;
export type InsertCryptoNetworkSettings = z.infer<typeof insertCryptoNetworkSettingsSchema>;