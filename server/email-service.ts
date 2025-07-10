import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import { Notification, User, Program, Submission } from '@shared/schema';

// Initialize SendGrid
const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey) {
  console.error('SENDGRID_API_KEY environment variable is not set');
} else {
  sgMail.setApiKey(sendGridApiKey);
  console.log('SendGrid API key configured successfully');
}

// Generate a verification token
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// General email sending function using SendGrid templates
export async function sendTemplatedEmail(
  to: string,
  templateId: string,
  dynamicData: Record<string, any>,
  from: string = 'notifications@cyberhunt.com'
): Promise<boolean> {
  try {
    if (!sendGridApiKey) {
      console.error('SendGrid API key is not configured');
      return false;
    }

    const msg = {
      to,
      from,
      templateId,
      dynamic_template_data: dynamicData,
    };

    const response = await sgMail.send(msg);
    console.log(`Email sent successfully to ${to} using template ${templateId}`, response[0].statusCode);
    return true;
  } catch (error: any) {
    console.error('Failed to send templated email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
}

// Send a verification email
export async function sendVerificationEmail(userId: number, userEmail: string, username: string): Promise<string> {
  try {
    // Generate a verification token
    const token = generateVerificationToken();

    // Save the token to the user record
    await storage.setVerificationToken(userId, token);

    // Create the verification link
    const confirm_link = `https://cyberhunt.com.tn/confirm?token=${token}`;

    // Use your SendGrid verification template
    const success = await sendTemplatedEmail(
      userEmail,
      'YOUR_VERIFICATION_TEMPLATE_ID', // Replace with your actual template ID
      {
        username: username,
        confirm_link: confirm_link,
      },
      'verification@cyberhunt.com'
    );

    if (success) {
      console.log(`Verification email sent to ${userEmail}`);
      return token;
    } else {
      throw new Error('Failed to send verification email');
    }

  } catch (error: any) {
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

// Send a notification email based on notification object
export async function sendNotificationEmail(notification: NotificationEmailData): Promise<boolean> {
  try {
    // Get user details
    const user = await storage.getUser(notification.userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    // Create base URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const actionUrl = notification.link ? `${baseUrl}${notification.link}` : `${baseUrl}/dashboard`;

    // Map notification types to template IDs and prepare dynamic data
    let templateId = '';
    let dynamicData: Record<string, any> = {
      username: user.username,
      message: notification.message,
      action_url: actionUrl,
      base_url: baseUrl,
    };

    switch(notification.type) {
      case 'new_submission':
        templateId = 'YOUR_NEW_SUBMISSION_TEMPLATE_ID'; // Replace with your actual template ID
        break;

      case 'status_change':
        templateId = 'YOUR_STATUS_CHANGE_TEMPLATE_ID'; // Replace with your actual template ID
        break;

      case 'achievement':
        templateId = 'YOUR_ACHIEVEMENT_TEMPLATE_ID'; // Replace with your actual template ID
        break;

      default: // system
        templateId = 'YOUR_SYSTEM_NOTIFICATION_TEMPLATE_ID'; // Replace with your actual template ID
    }

    if (!templateId) {
      console.error(`No template ID configured for notification type: ${notification.type}`);
      return false;
    }

    return await sendTemplatedEmail(user.email, templateId, dynamicData);

  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}

// Send a submission status update email
export async function sendSubmissionStatusEmail(submission: Submission, message: string): Promise<boolean> {
  try {
    // Get user and program details
    const user = await storage.getUser(submission.userId);
    const program = await storage.getProgram(submission.programId);

    if (!user || !user.email || !user.isEmailVerified || !program) return false;

    // Create the status notification
    const notificationData = {
      type: 'status_change',
      message: `Your submission for "${program.name}" has been ${submission.status}. ${message}`,
      link: `/submissions/${submission.id}`,
      userId: user.id,
      relatedId: submission.id
    };

    const createdNotification = await storage.createNotification(notificationData);

    // Use templated email function
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const actionUrl = `${baseUrl}/submissions/${submission.id}`;

    const dynamicData = {
      username: user.username,
      program_name: program.name,
      submission_title: submission.title,
      status: submission.status,
      message: message,
      action_url: actionUrl,
      base_url: baseUrl,
    };

    return await sendTemplatedEmail(
      user.email,
      'YOUR_SUBMISSION_STATUS_TEMPLATE_ID', // Replace with your actual template ID
      dynamicData
    );

  } catch (error) {
    console.error('Failed to send submission status email:', error);
    return false;
  }
}

// Send an achievement notification email
export async function sendAchievementEmail(userId: number, achievementTitle: string, description: string): Promise<boolean> {
  try {
    // Get user details
    const user = await storage.getUser(userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    // Create the achievement notification content
    const notificationData = {
      type: 'achievement',
      message: `Achievement Unlocked: ${achievementTitle} - ${description}`,
      link: '/dashboard',
      userId,
      relatedId: null
    };

    const createdNotification = await storage.createNotification(notificationData);

    // Use templated email function
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const dynamicData = {
      username: user.username,
      achievement_title: achievementTitle,
      achievement_description: description,
      action_url: `${baseUrl}/dashboard`,
      base_url: baseUrl,
    };

    return await sendTemplatedEmail(
      user.email,
      'YOUR_ACHIEVEMENT_TEMPLATE_ID', // Replace with your actual template ID
      dynamicData
    );

  } catch (error) {
    console.error('Failed to send achievement email:', error);
    return false;
  }
}

// Send withdrawal completion confirmation email
export async function sendWithdrawalCompletedEmail(withdrawal: any): Promise<boolean> {
  try {
    // Get user details using the withdrawal data
    const user = await storage.getUser(withdrawal.userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Format the withdrawal method for display
    const methodDisplay = withdrawal.method === 'paypal' ? 'PayPal' : 
                         withdrawal.method === 'wise' ? 'Wise' : 
                         withdrawal.method === 'crypto' ? 'Cryptocurrency' : 
                         withdrawal.method.charAt(0).toUpperCase() + withdrawal.method.slice(1);

    const dynamicData = {
      username: user.username,
      amount: withdrawal.amount,
      method: methodDisplay,
      destination: withdrawal.destination,
      date: new Date().toLocaleDateString(),
      action_url: `${baseUrl}/wallet`,
      base_url: baseUrl,
    };

    const success = await sendTemplatedEmail(
      user.email,
      'YOUR_WITHDRAWAL_COMPLETED_TEMPLATE_ID', // Replace with your actual template ID
      dynamicData,
      'payments@cyberhunt.com'
    );

    if (success) {
      // Create notification for the user
      await storage.createNotification({
        type: 'system',
        message: `Your withdrawal of $${withdrawal.amount} has been completed and sent to your ${methodDisplay} account.`,
        link: '/wallet',
        userId: user.id,
        relatedId: withdrawal.id
      });
    }

    return success;

  } catch (error) {
    console.error('Failed to send withdrawal completion email:', error);
    return false;
  }
}

// Send a welcome email after verification
export async function sendWelcomeEmail(userId: number): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email || !user.isEmailVerified) return false;

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Get active programs for recommendation
    const programs = await storage.getPublicPrograms();
    const topPrograms = programs.slice(0, 3);

    const dynamicData = {
      username: user.username,
      dashboard_url: `${baseUrl}/dashboard`,
      base_url: baseUrl,
      recommended_programs: topPrograms.map(program => ({
        name: program.name,
        description: program.description,
        url: `${baseUrl}/programs/${program.id}`
      })),
    };

    return await sendTemplatedEmail(
      user.email,
      'YOUR_WELCOME_TEMPLATE_ID', // Replace with your actual template ID
      dynamicData,
      'welcome@cyberhunt.com'
    );

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(userEmail: string, username: string, resetToken: string): Promise<boolean> {
  try {
    const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const dynamicData = {
      username: username,
      reset_link: resetLink,
      base_url: process.env.BASE_URL || 'http://localhost:3000',
    };

    return await sendTemplatedEmail(
      userEmail,
      'YOUR_PASSWORD_RESET_TEMPLATE_ID', // Replace with your actual template ID
      dynamicData,
      'security@cyberhunt.com'
    );

  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}