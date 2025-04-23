import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import { Notification, User, Program, Submission } from '@shared/schema';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a verification token
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// Send a verification email
export async function sendVerificationEmail(userId: number, userEmail: string, username: string): Promise<string> {
  try {
    const token = generateVerificationToken();
    await storage.setVerificationToken(userId, token);

    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

    await resend.emails.send({
      from: 'CyberHunt <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Verify Your CyberHunt Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00ff00; border-radius: 5px; background-color: #0a0a0a; color: #cccccc;">
          <h2 style="color: #00ff00; text-align: center;">CyberHunt Email Verification</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Thank you for registering with CyberHunt, the elite bug bounty platform for cybersecurity professionals.</p>
          <p>Please verify your email by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #000000; padding: 10px; border-radius: 4px; word-break: break-all;"><a href="${verificationUrl}" style="color: #00ff00;">${verificationUrl}</a></p>
          <p><strong>Note:</strong> This link will expire in 24 hours.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return token;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

// Verify a user's email using their token
export async function verifyEmailWithToken(token: string): Promise<boolean> {
  try {
    const user = await storage.verifyEmail(token);
    return !!user;
  } catch (error) {
    console.error('Failed to verify email with token:', error);
    return false;
  }
}

// Helper function to send any email
async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({
      from: 'CyberHunt <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendNotificationEmail(notification: any): Promise<boolean> {
  const user = await storage.getUser(notification.userId);
  if (!user?.email || !user.isEmailVerified) return false;

  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const actionUrl = notification.link ? `${baseUrl}${notification.link}` : `${baseUrl}/dashboard`;

  return sendEmail(
    user.email,
    'CyberHunt Notification',
    `<div style="font-family: Arial, sans-serif;">
      <h2>New Notification</h2>
      <p>${notification.message}</p>
      <a href="${actionUrl}">View Details</a>
    </div>`
  );
}

export async function sendSubmissionStatusEmail(submission: Submission, message: string): Promise<boolean> {
  try {
    const user = await storage.getUser(submission.userId);
    const program = await storage.getProgram(submission.programId);
    if (!user || !user.email || !user.isEmailVerified || !program) return false;

    const notificationData = {
      type: 'status_change',
      message: `Your submission for "${program.name}" has been ${submission.status}. ${message}`,
      link: `/submissions/${submission.id}`,
      userId: user.id,
      relatedId: submission.id
    };

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const actionUrl = notificationData.link ? `${baseUrl}${notificationData.link}` : `${baseUrl}/dashboard`;

    const subject = 'Submission Status Update';
    const content = `
      <p>Hello <strong>${user.username}</strong>,</p>
      <p>There has been a change to one of your submissions:</p>
      <p>${notificationData.message}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Details</a>
      </div>
    `;

    return sendEmail(user.email, subject, getEmailTemplate(subject, content));
  } catch (error) {
    console.error('Failed to send submission status email:', error);
    return false;
  }
}


export async function sendAchievementEmail(userId: number, achievementTitle: string, description: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    const notificationData = {
      type: 'achievement',
      message: `Achievement Unlocked: ${achievementTitle} - ${description}`,
      link: '/dashboard',
      userId,
      relatedId: null
    };

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const actionUrl = notificationData.link ? `${baseUrl}${notificationData.link}` : `${baseUrl}/dashboard`;

    const subject = 'You\'ve Earned an Achievement on CyberHunt!';
    const content = `
      <p>Hello <strong>${user.username}</strong>,</p>
      <p>Congratulations! You've reached a new milestone:</p>
      <p style="font-size: 18px; text-align: center; color: #00ff00; padding: 15px; background-color: #111111; border-radius: 5px;">${notificationData.message}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">See Your Achievements</a>
      </div>
    `;

    return sendEmail(user.email, subject, getEmailTemplate(subject, content));
  } catch (error) {
    console.error('Failed to send achievement email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userId: number): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    const programs = await storage.getPublicPrograms();
    const topPrograms = programs.slice(0, 3);

    let programRecommendations = '';
    if (topPrograms.length > 0) {
      programRecommendations = `
        <p style="margin-top: 20px; font-weight: bold; color: #00ff00;">Recommended Programs to Start With:</p>
        <div style="background-color: #111; padding: 15px; border-radius: 5px; margin-top: 10px;">
          ${topPrograms.map(program => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333;">
              <p style="font-weight: bold; margin-bottom: 5px;">${program.name}</p>
              <p style="margin-bottom: 5px; font-size: 14px;">${program.description}</p>
              <a href="${baseUrl}/programs/${program.id}" style="color: #00ff00; text-decoration: none; font-size: 14px;">View Details →</a>
            </div>
          `).join('')}
        </div>
      `;
    }

    const emailContent = {
      from: '"CyberHunt" <welcome@cyberhunt.com>',
      to: user.email,
      subject: 'Welcome to CyberHunt - Your Account is Verified!',
      text: `Hello ${user.username},

Welcome to CyberHunt! Your account has been successfully verified.

You are now part of an elite community of cybersecurity professionals working to make the digital world safer.

GETTING STARTED GUIDE:
1. Explore Available Programs - Browse through the list of active bug bounty programs and find those that match your skills.
2. Submit Vulnerability Reports - Use our detailed submission form to report security issues you discover.
3. Track Your Progress - Monitor your submission statuses and rewards through your personalized dashboard.
4. Climb the Leaderboard - Earn reputation points for successful submissions and become a top-ranked hacker.

${topPrograms.length > 0 ? `RECOMMENDED PROGRAMS TO START WITH:
${topPrograms.map(program => `- ${program.name}: ${program.description.substring(0, 100)}${program.description.length > 100 ? '...' : ''}`).join('\n')}
` : ''}
NEED HELP?
If you have any questions or need assistance, visit our FAQ section or reach out to the support team.

Get started now by visiting: ${baseUrl}/dashboard

Happy hunting!

The CyberHunt Team`,
      html: getEmailTemplate('Welcome to CyberHunt!', `
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>Welcome to CyberHunt! Your account has been successfully verified.</p>
        <p>You are now part of an elite community of cybersecurity professionals working to make the digital world safer.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/dashboard" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
        </div>
        <p style="margin-top: 25px; font-weight: bold; color: #00ff00;">Getting Started Guide:</p>
        <ol style="color: #cccccc; margin-left: 20px;">
          <li style="margin-bottom: 8px;"><strong>Explore Available Programs</strong> - Browse through the list of active bug bounty programs and find those that match your skills.</li>
          <li style="margin-bottom: 8px;"><strong>Submit Vulnerability Reports</strong> - Use our detailed submission form to report security issues you discover.</li>
          <li style="margin-bottom: 8px;"><strong>Track Your Progress</strong> - Monitor your submission statuses and rewards through your personalized dashboard.</li>
          <li style="margin-bottom: 8px;"><strong>Climb the Leaderboard</strong> - Earn reputation points for successful submissions and become a top-ranked hacker.</li>
        </ol>
        ${programRecommendations}
        <p style="margin-top: 25px; font-weight: bold; color: #00ff00;">Need Help?</p>
        <p>If you have any questions or need assistance, visit our <a href="${baseUrl}/faq" style="color: #00ff00;">FAQ section</a> or reach out to the support team.</p>
        <p style="margin-top: 15px;">Happy hunting!</p>
      `),
    };

    return sendEmail(user.email, emailContent.subject, emailContent.html);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// Email template wrapper for consistent styling
function getEmailTemplate(title: string, content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00ff00; border-radius: 5px; background-color: #0a0a0a; color: #cccccc;">
      <h2 style="color: #00ff00; text-align: center;">${title}</h2>
      ${content}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
      </div>
    </div>
  `;
}

// Used for notification emails to ensure correct type checking
interface NotificationEmailData {
  id: number;
  type: string;
  message: string;
  link: string | null;
  isRead: boolean | null;
  userId: number;
  relatedId: number | null;
  createdAt: Date | null;
}