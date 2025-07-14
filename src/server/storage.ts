import session from "express-session";
import createMemoryStore from "memorystore";
import { User, InsertUser, Program, InsertProgram, Submission, InsertSubmission, Activity, InsertActivity } from "../shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User CRUD
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, reputation: number): Promise<User | undefined>;
  
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
  
  // Session storage
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private programs: Map<number, Program>;
  private submissions: Map<number, Submission>;
  private activities: Map<number, Activity>;
  
  currentUserId: number;
  currentProgramId: number;
  currentSubmissionId: number;
  currentActivityId: number;
  sessionStore: session.SessionStore;
  
  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.submissions = new Map();
    this.activities = new Map();
    
    this.currentUserId = 1;
    this.currentProgramId = 1;
    this.currentSubmissionId = 1;
    this.currentActivityId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with some example programs
    this.initializePrograms();
  }
  
  private initializePrograms() {
    const programs: InsertProgram[] = [
      {
        name: "SecureBank Web App",
        description: "Find vulnerabilities in our banking web application.",
        company: "SecureBank Inc.",
        minReward: 100,
        maxReward: 5000,
        isActive: true,
      },
      {
        name: "CloudStore API",
        description: "Security testing for our cloud storage API endpoints.",
        company: "CloudStore Technologies",
        minReward: 250,
        maxReward: 10000,
        isActive: true,
      },
      {
        name: "HealthTrack Mobile App",
        description: "Security assessment of our health tracking mobile application.",
        company: "HealthTrack Systems",
        minReward: 150,
        maxReward: 3000,
        isActive: true,
      },
    ];
    
    programs.forEach(program => this.createProgram(program));
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    const user: User = { 
      id, 
      ...insertUser,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUserReputation(id: number, reputation: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, reputation };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }
  
  async getAllPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }
  
  async getPublicPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values()).filter(p => p.isActive);
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.currentProgramId++;
    const now = new Date();
    
    const program: Program = { 
      id, 
      ...insertProgram,
      createdAt: now 
    };
    
    this.programs.set(id, program);
    return program;
  }
  
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }
  
  async getSubmissionsByUser(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(s => s.userId === userId);
  }
  
  async getSubmissionsByProgram(programId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(s => s.programId === programId);
  }
  
  async createSubmission(submission: InsertSubmission & { userId: number }): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const now = new Date();
    
    const newSubmission: Submission = {
      id,
      userId: submission.userId,
      programId: submission.programId as number,
      title: submission.title,
      description: submission.description,
      severity: submission.severity,
      stepsToReproduce: submission.stepsToReproduce,
      impact: submission.impact,
      status: submission.status || "pending",
      reward: null,
      submittedAt: now,
      updatedAt: now,
    };
    
    this.submissions.set(id, newSubmission);
    
    // Create an activity for this submission
    await this.createActivity({
      userId: submission.userId,
      type: "submission",
      message: `You submitted a vulnerability report: ${submission.title}`,
    });
    
    return newSubmission;
  }
  
  async updateSubmissionStatus(id: number, status: string, reward?: number): Promise<Submission | undefined> {
    const submission = await this.getSubmission(id);
    if (!submission) return undefined;
    
    const updatedSubmission = {
      ...submission,
      status,
      reward: reward ?? submission.reward,
      updatedAt: new Date(),
    };
    
    this.submissions.set(id, updatedSubmission);
    
    // Create an activity for this status update
    let message = `Your submission #${id} status changed to ${status}`;
    if (reward) message += ` with a reward of $${reward}`;
    
    await this.createActivity({
      userId: submission.userId,
      type: "status",
      message,
    });
    
    return updatedSubmission;
  }
  
  async getUserActivities(userId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    
    const activity: Activity = {
      id,
      ...insertActivity,
      createdAt: now,
    };
    
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();