import { Resend } from 'resend';
import { storage } from './storage';
import { randomBytes } from 'crypto';
import { Notification, User, Program, Submission } from '@shared/schema';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate tokens
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Send verification email
export async function sendVerificationEmail(userId: number, email: string, username: string): Promise<string> {
  const token = generateToken();
  await storage.setVerificationToken(userId, token);

  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'CyberHunt <verification@yourdomain.com>',
    to: email,
    subject: 'Verify Your CyberHunt Account',
    html: `
      <h2>Verify Your Email</h2>
      <p>Hello ${username},</p>
      <p>Please verify your email by clicking this link:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
  });

  return token;
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

  await resend.emails.send({
    from: 'CyberHunt <noreply@yourdomain.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
    `
  });
}

// Send a notification email based on notification object
export async function sendNotificationEmail(notification: Notification): Promise<boolean> {
  try {
    const user = await storage.getUser(notification.userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const actionUrl = notification.link ? `${baseUrl}${notification.link}` : `${baseUrl}/dashboard`;

    let subject = 'CyberHunt Notification';
    let content = '';

    switch(notification.type) {
      case 'new_submission':
        subject = 'New Submission on CyberHunt';
        content = `
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>You have a new bug submission to review.</p>
          <p>${notification.message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Submission</a>
          </div>
        `;
        break;

      case 'status_change':
        subject = 'Submission Status Update';
        content = `
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>There has been a change to one of your submissions:</p>
          <p>${notification.message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Details</a>
          </div>
        `;
        break;

      case 'achievement':
        subject = 'You\'ve Earned an Achievement on CyberHunt!';
        content = `
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Congratulations! You've reached a new milestone:</p>
          <p style="font-size: 18px; text-align: center; color: #00ff00; padding: 15px; background-color: #111111; border-radius: 5px;">${notification.message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">See Your Achievements</a>
          </div>
        `;
        break;

      default: // system
        subject = 'CyberHunt System Notification';
        content = `
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>${notification.message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          </div>
        `;
    }

    await resend.emails.send({
      from: '"CyberHunt" <notifications@cyberhunt.com>',
      to: user.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00ff00; border-radius: 5px; background-color: #0a0a0a; color: #cccccc;">
          <h2 style="color: #00ff00; text-align: center;">${subject}</h2>
          ${content}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}


// Send a submission status update email
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

    await storage.createNotification(notificationData);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const linkPath = notificationData.link;
    const actionUrl = linkPath ? `${baseUrl}${linkPath}` : `${baseUrl}/dashboard`;

    const subject = 'Submission Status Update';
    const content = `
      <p>Hello <strong>${user.username}</strong>,</p>
      <p>There has been a change to one of your submissions:</p>
      <p>${notificationData.message}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Details</a>
      </div>
    `;

    await resend.emails.send({
      from: '"CyberHunt" <notifications@cyberhunt.com>',
      to: user.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00ff00; border-radius: 5px; background-color: #0a0a0a; color: #cccccc;">
          <h2 style="color: #00ff00; text-align: center;">${subject}</h2>
          ${content}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send submission status email:', error);
    return false;
  }
}


// Send an achievement notification email
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

    await storage.createNotification(notificationData);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const linkPath = notificationData.link;
    const actionUrl = linkPath ? `${baseUrl}${linkPath}` : `${baseUrl}/dashboard`;

    const subject = 'You\'ve Earned an Achievement on CyberHunt!';
    const content = `
      <p>Hello <strong>${user.username}</strong>,</p>
      <p>Congratulations! You've reached a new milestone:</p>
      <p style="font-size: 18px; text-align: center; color: #00ff00; padding: 15px; background-color: #111111; border-radius: 5px;">${notificationData.message}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">See Your Achievements</a>
      </div>
    `;

    await resend.emails.send({
      from: '"CyberHunt" <notifications@cyberhunt.com>',
      to: user.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00ff00; border-radius: 5px; background-color: #0a0a0a; color: #cccccc;">
          <h2 style="color: #00ff00; text-align: center;">${subject}</h2>
          ${content}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send achievement email:', error);
    return false;
  }
}


// Send a welcome email after verification
export async function sendWelcomeEmail(userId: number): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

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

    await resend.emails.send({
      from: '"CyberHunt" <welcome@cyberhunt.com>',
      to: user.email,
      subject: 'Welcome to CyberHunt - Your Account is Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #00ff00; border-radius: 5px; background-color: #0a0a0a; color: #cccccc;">
          <h2 style="color: #00ff00; text-align: center;">Welcome to CyberHunt!</h2>
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
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

//This function is no longer needed since we're using Resend.
// async function createProductionTransporter() { ... }

//This function is no longer needed since we're using Resend.
// export function generateVerificationToken(): string { ... }

//This function is no longer needed since we're using Resend.
// export async function verifyEmailWithToken(token: string): Promise<boolean> { ... }


//This function is no longer needed since we're using Resend.
// function getEmailTemplate(title: string, content: string): string { ... }


//This interface is no longer needed since we're using Resend and simplified the notification process.
// interface NotificationEmailData { ... }