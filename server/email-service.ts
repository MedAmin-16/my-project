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

// Send a verification email
export async function sendVerificationEmail(userId: number, userEmail: string, username: string): Promise<string> {
  try {
    // Generate a verification token
    const token = generateVerificationToken();

    // Save the token to the user record
    await storage.setVerificationToken(userId, token);

    // Create the verification link
    const confirm_link = `https://cyberhunt.com.tn/confirm?token=${token}`;

    if (!sendGridApiKey) {
      console.error('SendGrid API key is not configured');
      return '';
    }

    const msg = {
      to: userEmail,
      from: 'verification@cyberhunt.com', // Replace with your verified sender
      templateId: 'YOUR_TEMPLATE_ID', // Replace with your template ID
      dynamic_template_data: {
        username: username,
        confirm_link: confirm_link,
      },
    };

    await sgMail.send(msg);
    console.log(`Verification email sent to ${userEmail}`);
    return token;

  } catch (error: any) {
    console.error('Failed to send verification email:', error);
    if (error.response) {
      console.error(error.response.body)
    }
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

    // Default link to notifications page if none provided
    const actionUrl = notification.link ? `${baseUrl}${notification.link}` : `${baseUrl}/dashboard`;

    // Content based on notification type
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

    // Email content with template
    const emailContent = {
      from: '"CyberHunt" <notifications@cyberhunt.com>',
      to: user.email,
      subject,
      text: `${subject}\n\nHello ${user.username},\n\n${notification.message}\n\nCheck it out here: ${actionUrl}\n\nThe CyberHunt Team`,
      html: getEmailTemplate(subject, content),
    };

    if (!sendGridApiKey) {
      console.error('SendGrid API key is not configured');
      return false;
    }

    // Send email using SendGrid
    try {
      const response = await sgMail.send(emailContent);
      console.log(`Notification email sent successfully to ${user.email}`, response[0].statusCode);
      return true;
    } catch (error: any) {
      console.error('Failed to send notification email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      return false;
    }
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

    // Direct email sending without using the notification email function
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

    const emailContent = {
      from: '"CyberHunt" <notifications@cyberhunt.com>',
      to: user.email,
      subject,
      text: `${subject}\n\nHello ${user.username},\n\n${notificationData.message}\n\nCheck it out here: ${actionUrl}\n\nThe CyberHunt Team`,
      html: getEmailTemplate(subject, content),
    };

    if (!sendGridApiKey) {
      console.error('SendGrid API key is not configured');
      return false;
    }

    // Send email using SendGrid
    try{
        const response = await sgMail.send(emailContent);
        console.log(`Submission status email sent successfully to ${user.email}`, response[0].statusCode);
        return true;
    } catch(error: any){
        console.error('Failed to send submission status email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        return false;
    }
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

    // Direct email sending without using the notification email function
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

    const emailContent = {
      from: '"CyberHunt" <notifications@cyberhunt.com>',
      to: user.email,
      subject,
      text: `${subject}\n\nHello ${user.username},\n\n${notificationData.message}\n\nCheck it out here: ${actionUrl}\n\nThe CyberHunt Team`,
      html: getEmailTemplate(subject, content),
    };
    if (!sendGridApiKey) {
        console.error('SendGrid API key is not configured');
        return false;
      }

      // Send email using SendGrid
    try {
        const response = await sgMail.send(emailContent);
        console.log(`Achievement email sent successfully to ${user.email}`, response[0].statusCode);
        return true;
    } catch (error: any){
        console.error('Failed to send achievement email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        return false;
    }

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

    // Email content
    const emailContent = {
      from: '"CyberHunt" <payments@cyberhunt.com>',
      to: user.email,
      subject: 'Withdrawal Completed - Payment Sent Successfully',
      text: `Hello ${user.username},

Great news! Your withdrawal request has been completed and the payment has been sent successfully.

PAYMENT DETAILS:
- Amount: $${withdrawal.amount}
- Method: ${methodDisplay}
- Destination: ${withdrawal.destination}
- Date: ${new Date().toLocaleDateString()}

The funds should arrive in your account within the standard processing time for ${methodDisplay} transfers.

If you have any questions about this payment, please contact our support team.

Thank you for being part of the CyberHunt community!

The CyberHunt Team`,
      html: getEmailTemplate('Payment Sent Successfully! 💰', `
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>Great news! Your withdrawal request has been completed and the payment has been sent successfully.</p>
        
        <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00ff00;">
          <h3 style="color: #00ff00; margin-top: 0;">Payment Details</h3>
          <table style="width: 100%; color: #cccccc;">
            <tr><td style="padding: 5px 0;"><strong>Amount:</strong></td><td style="padding: 5px 0;">$${withdrawal.amount}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Method:</strong></td><td style="padding: 5px 0;">${methodDisplay}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Destination:</strong></td><td style="padding: 5px 0;">${withdrawal.destination}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td style="padding: 5px 0;">${new Date().toLocaleDateString()}</td></tr>
          </table>
        </div>

        <p style="background-color: #1a1a1a; padding: 15px; border-radius: 5px; border-left: 3px solid #00ff00;">
          💡 <strong>Processing Time:</strong> The funds should arrive in your account within the standard processing time for ${methodDisplay} transfers.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/wallet" style="background-color: #00ff00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Wallet History</a>
        </div>

        <p>If you have any questions about this payment, please contact our support team.</p>
        <p style="margin-top: 20px;">Thank you for being part of the CyberHunt community!</p>
      `),
    };

    if (!sendGridApiKey) {
      console.error('SendGrid API key is not configured');
      return false;
    }

    // Send email using SendGrid
    try {
      const response = await sgMail.send(emailContent);
      console.log(`Withdrawal completion email sent successfully to ${user.email}`, response[0].statusCode);
      
      // Create notification for the user
      await storage.createNotification({
        type: 'system',
        message: `Your withdrawal of $${withdrawal.amount} has been completed and sent to your ${methodDisplay} account.`,
        link: '/wallet',
        userId: user.id,
        relatedId: withdrawal.id
      });

      return true;
    } catch (error: any) {
      console.error('Failed to send withdrawal completion email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      return false;
    }

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

    // Create program recommendations HTML
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

    // Email content
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

    if (!sendGridApiKey) {
        console.error('SendGrid API key is not configured');
        return false;
    }

    // Send email using SendGrid
    try{
      const response = await sgMail.send(emailContent);
      console.log(`Welcome email sent successfully to ${user.email}`, response[0].statusCode);
      return true;
    } catch(error: any){
        console.error('Failed to send welcome email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        return false;
    }

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}