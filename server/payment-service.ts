
import Stripe from 'stripe';
import { storage } from './storage';
import { sendSubmissionStatusEmail } from './email-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake', {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  // Commission calculation
  static calculateCommission(amount: number, rate: number = 1500): { commission: number, payout: number } {
    const commission = Math.floor((amount * rate) / 10000); // rate is in basis points
    const payout = amount - commission;
    return { commission, payout };
  }

  // Create payment intent for company deposits
  static async createPaymentIntent(companyId: number, amount: number, currency: string = 'USD', purpose: string = 'wallet_topup') {
    try {
      // Check rate limits
      const canProceed = await storage.checkRateLimit(companyId, '', 'payment_intent', 10, 60);
      if (!canProceed) {
        throw new Error('Rate limit exceeded for payment intents');
      }

      // Create Stripe payment intent
      const stripeIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          companyId: companyId.toString(),
          purpose
        }
      });

      // Store in database
      const paymentIntent = await storage.createPaymentIntent({
        stripePaymentIntentId: stripeIntent.id,
        companyId,
        amount,
        currency: currency.toUpperCase(),
        purpose,
        metadata: { stripeClientSecret: stripeIntent.client_secret }
      });

      return {
        paymentIntent,
        clientSecret: stripeIntent.client_secret
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment and update company wallet
  static async confirmPayment(paymentIntentId: string) {
    try {
      const stripeIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (stripeIntent.status !== 'succeeded') {
        throw new Error('Payment not completed');
      }

      // Update payment intent status
      const paymentIntent = await storage.updatePaymentIntent(
        parseInt(stripeIntent.metadata.companyId), 
        'succeeded', 
        paymentIntentId
      );

      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }

      // Update company wallet
      await storage.updateCompanyWalletBalance(paymentIntent.companyId, stripeIntent.amount_received);

      // Create transaction record
      await storage.createCompanyTransaction({
        companyId: paymentIntent.companyId,
        amount: stripeIntent.amount_received,
        type: 'payment',
        note: `Payment via Stripe: ${paymentIntentId}`
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Create escrow when bounty is approved
  static async createEscrowForBounty(submissionId: number, bountyAmount: number, companyId: number) {
    try {
      const { commission, payout } = this.calculateCommission(bountyAmount);

      // Check if company has sufficient balance
      const companyWallet = await storage.getCompanyWallet(companyId);
      if (!companyWallet || companyWallet.balance < bountyAmount) {
        throw new Error('Insufficient company balance');
      }

      // Create escrow account
      const escrow = await storage.createEscrowAccount({
        companyId,
        submissionId,
        amount: bountyAmount,
        currency: 'USD',
        platformCommission: commission,
        researcherPayout: payout,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Deduct from company wallet
      await storage.updateCompanyWalletBalance(companyId, -bountyAmount);

      // Create commission record
      await storage.createCommission({
        submissionId,
        totalAmount: bountyAmount,
        commissionRate: 1500, // 15%
        commissionAmount: commission,
        currency: 'USD'
      });

      return escrow;
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw error;
    }
  }

  // Release escrow and initiate payout
  static async releaseEscrowAndPayout(submissionId: number, paymentMethodId: number, paymentDetails: any) {
    try {
      const escrow = await storage.getEscrowBySubmission(submissionId);
      if (!escrow || escrow.status !== 'held') {
        throw new Error('Escrow not found or not in held status');
      }

      // Update escrow status
      await storage.updateEscrowStatus(escrow.id, 'released');

      // Get submission details
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      // Create payout
      const payout = await storage.createPayout({
        userId: submission.userId,
        submissionId,
        escrowAccountId: escrow.id,
        amount: escrow.researcherPayout,
        currency: escrow.currency,
        paymentMethodId,
        paymentMethodDetails: paymentDetails,
        scheduledFor: new Date()
      });

      // Process payout based on payment method
      await this.processPayout(payout.id);

      return payout;
    } catch (error) {
      console.error('Error releasing escrow and creating payout:', error);
      throw error;
    }
  }

  // Process payout based on payment method
  static async processPayout(payoutId: number) {
    try {
      const payout = await storage.getUserPayouts(payoutId);
      if (!payout) {
        throw new Error('Payout not found');
      }

      // Update status to processing
      await storage.updatePayoutStatus(payoutId, 'processing');

      // Simulate processing based on payment method
      // In production, integrate with actual payment providers
      
      const paymentMethod = await storage.getPaymentMethods();
      const method = paymentMethod.find(pm => pm.id === payout.paymentMethodId);

      if (!method) {
        throw new Error('Payment method not found');
      }

      let externalTransactionId: string;
      let success = false;

      switch (method.type) {
        case 'digital_wallet':
          // Simulate PayPal/Stripe payout
          externalTransactionId = `${method.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          success = Math.random() > 0.1; // 90% success rate for simulation
          break;

        case 'crypto':
          // Simulate crypto transfer
          externalTransactionId = `0x${Math.random().toString(16).substr(2, 40)}`;
          success = Math.random() > 0.05; // 95% success rate for simulation
          break;

        case 'bank_transfer':
          // Simulate bank transfer
          externalTransactionId = `WIRE_${Date.now()}`;
          success = Math.random() > 0.02; // 98% success rate for simulation
          break;

        default:
          throw new Error('Unsupported payment method');
      }

      if (success) {
        await storage.updatePayoutStatus(payoutId, 'completed', externalTransactionId);
        
        // Send success notification
        const submission = await storage.getSubmission(payout.submissionId);
        if (submission) {
          await sendSubmissionStatusEmail(submission, `Your bounty payment of $${payout.amount / 100} has been processed successfully via ${method.name}.`);
        }
      } else {
        await storage.updatePayoutStatus(payoutId, 'failed', undefined, 'Payment processor error');
      }

      return success;
    } catch (error) {
      console.error('Error processing payout:', error);
      await storage.updatePayoutStatus(payoutId, 'failed', undefined, error.message);
      throw error;
    }
  }

  // Handle webhooks from payment providers
  static async handleStripeWebhook(event: any) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id);
          break;

        case 'payment_intent.payment_failed':
          // Handle failed payment
          await storage.updatePaymentIntent(
            parseInt(event.data.object.metadata.companyId),
            'failed'
          );
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  // Fraud detection
  static async detectFraud(userId: number, amount: number, ipAddress: string): Promise<{ isFraudulent: boolean, reason?: string }> {
    try {
      // Check for suspicious patterns
      const recentPayouts = await storage.getUserPayouts(userId);
      const recentLargePayouts = recentPayouts.filter(p => 
        p.amount > 50000 && // > $500
        new Date(p.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
      );

      if (recentLargePayouts.length > 3) {
        return { isFraudulent: true, reason: 'Multiple large payouts in 24 hours' };
      }

      if (amount > 100000) { // > $1000
        return { isFraudulent: true, reason: 'Large payout amount requires manual review' };
      }

      // Check rate limits
      const canProceed = await storage.checkRateLimit(userId, ipAddress, 'payout_request', 5, 60);
      if (!canProceed) {
        return { isFraudulent: true, reason: 'Rate limit exceeded' };
      }

      return { isFraudulent: false };
    } catch (error) {
      console.error('Error in fraud detection:', error);
      return { isFraudulent: false };
    }
  }
}
