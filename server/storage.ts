import { users, type User, type InsertUser } from "@shared/schema";
import { programs, type Program, type InsertProgram } from "@shared/schema";
import { submissions, type Submission, type InsertSubmission } from "@shared/schema";
import { activities, type Activity, type InsertActivity } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User CRUD
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, reputation: number): Promise<User | undefined>;
  getLeaderboard(limit?: number): Promise<User[]>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private programs: Map<number, Program>;
  private submissions: Map<number, Submission>;
  private activities: Map<number, Activity>;
  private notifications: Map<number, Notification>;
  
  currentUserId: number;
  currentProgramId: number;
  currentSubmissionId: number;
  currentActivityId: number;
  currentNotificationId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.submissions = new Map();
    this.activities = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentProgramId = 1;
    this.currentSubmissionId = 1;
    this.currentActivityId = 1;
    this.currentNotificationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add some initial programs
    this.initializePrograms();
  }

  private initializePrograms() {
    const initialPrograms: InsertProgram[] = [
      {
        name: "SecureCorp",
        description: "Security assessment for banking software",
        company: "SecureCorp Inc.",
        logo: "SC",
        rewardsRange: "$100 - $10,000",
        status: "active",
        scope: ["Web", "API", "Mobile"],
        isPrivate: false
      },
      {
        name: "CryptoTrade",
        description: "Crypto trading platform security program",
        company: "CryptoTrade LLC",
        logo: "CT",
        rewardsRange: "$500 - $25,000",
        status: "active",
        scope: ["Web", "Smart Contract"],
        isPrivate: false
      },
      {
        name: "NetShield",
        description: "Network security appliance testing",
        company: "NetShield Systems",
        logo: "NS",
        rewardsRange: "$1,000 - $50,000",
        status: "active",
        scope: ["Hardware", "Firmware"],
        isPrivate: true
      }
    ];
    
    initialPrograms.forEach(program => this.createProgram(program));
  }

  // User CRUD
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      reputation: 0, 
      rank: "Newbie",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserReputation(id: number, reputation: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    user.reputation = reputation;
    
    // Update rank based on reputation
    if (reputation >= 5000) {
      user.rank = "Elite Hunter";
    } else if (reputation >= 2000) {
      user.rank = "Veteran";
    } else if (reputation >= 500) {
      user.rank = "Bug Hunter";
    } else if (reputation >= 100) {
      user.rank = "Researcher";
    }
    
    this.users.set(id, user);
    return user;
  }

  // Program CRUD
  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }

  async getAllPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }

  async getPublicPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values()).filter(program => !program.isPrivate);
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.currentProgramId++;
    const program: Program = { 
      ...insertProgram, 
      id,
      createdAt: new Date()
    };
    this.programs.set(id, program);
    return program;
  }

  // Submission CRUD
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getSubmissionsByUser(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      submission => submission.userId === userId
    );
  }

  async getSubmissionsByProgram(programId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      submission => submission.programId === programId
    );
  }

  async createSubmission(submission: InsertSubmission & { userId: number }): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const newSubmission: Submission = {
      ...submission,
      id,
      status: "pending",
      reward: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.submissions.set(id, newSubmission);
    
    // Create an activity for the submission
    await this.createActivity({
      type: "submission_pending",
      message: "Submission under review",
      details: `${newSubmission.title} - ${newSubmission.type}`,
      userId: submission.userId,
      relatedId: id
    });
    
    return newSubmission;
  }

  async updateSubmissionStatus(id: number, status: string, reward?: number): Promise<Submission | undefined> {
    const submission = await this.getSubmission(id);
    if (!submission) return undefined;
    
    submission.status = status;
    submission.updatedAt = new Date();
    
    if (reward !== undefined) {
      submission.reward = reward;
    }
    
    this.submissions.set(id, submission);
    
    // Create an activity for the status change
    if (status === "accepted") {
      await this.createActivity({
        type: "submission_accepted",
        message: "Your submission was accepted",
        details: `${submission.title} - ${submission.type} - $${reward}`,
        userId: submission.userId,
        relatedId: id
      });
      
      // Update user reputation if accepted
      const user = await this.getUser(submission.userId);
      if (user) {
        let reputationIncrease = 0;
        
        // Calculate reputation based on severity
        switch (submission.severity) {
          case "Critical": reputationIncrease = 100; break;
          case "High": reputationIncrease = 50; break;
          case "Medium": reputationIncrease = 25; break;
          case "Low": reputationIncrease = 10; break;
          default: reputationIncrease = 5;
        }
        
        await this.updateUserReputation(user.id, user.reputation + reputationIncrease);
      }
    }
    
    return submission;
  }

  // Activity CRUD
  async getUserActivities(userId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Leaderboard
  async getLeaderboard(limit = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => {
        // Safely handle null reputation values by defaulting to 0
        const repA = a.reputation ?? 0;
        const repB = b.reputation ?? 0;
        return repB - repA; // Sort in descending order
      })
      .slice(0, limit);
  }
  
  // Notification CRUD
  async getUserNotifications(userId: number, limit = 10): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() ?? 0;
        const dateB = b.createdAt?.getTime() ?? 0;
        return dateB - dateA; // Sort newest first
      })
      .slice(0, limit);
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return notification;
  }
}

export const storage = new MemStorage();
