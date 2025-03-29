import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { storage } from './storage';

// Development transporter using Ethereal Email for testing
// In production, you would use a real SMTP service
let transporterPromise: Promise<nodemailer.Transporter>;

async function createTestTransporter() {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log(`Created Ethereal email test account: ${testAccount.user}`);
    console.log(`Preview link available at: https://ethereal.email/login`);
    console.log(`Email credentials: ${testAccount.user} / ${testAccount.pass}`);

    return transporter;
  } catch (error) {
    console.error('Failed to create test email transporter:', error);
    throw error;
  }
}

// Initialize the transporter once when the module is loaded
transporterPromise = createTestTransporter();

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
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    // Email content
    const emailContent = {
      from: '"CyberHunt" <verification@cyberhunt.com>',
      to: userEmail,
      subject: 'Verify Your CyberHunt Account',
      text: `Hello ${username},\n\nPlease verify your email by clicking on the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nThank you,\nThe CyberHunt Team`,
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
          <p>If you didn't register for an account, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; text-align: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} CyberHunt. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Get the transporter and send the email
    const transporter = await transporterPromise;
    const info = await transporter.sendMail(emailContent);

    console.log(`Verification email sent: ${info.messageId}`);
    
    // For Ethereal emails, log the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

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