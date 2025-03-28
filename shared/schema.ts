import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  reputation: integer("reputation").default(0),
  rank: text("rank").default("Newbie"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
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
