
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, Smartphone, Mail, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface TwoFactorVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  operation: string;
  amount?: number;
  currency?: string;
}

export function TwoFactorVerification({
  isOpen,
  onClose,
  onVerify,
  operation,
  amount,
  currency = 'USD'
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [method, setMethod] = useState<'sms' | 'email' | 'app'>('email');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const sendVerificationCode = async () => {
    try {
      const response = await fetch('/api/auth/send-2fa-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          method, 
          operation,
          amount: amount ? Math.round(amount * 100) : undefined
        })
      });

      if (response.ok) {
        setCodeSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: "Verification Code Sent",
          description: `A 6-digit code has been sent to your ${method === 'email' ? 'email' : 'phone'}.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const success = await onVerify(code);
      if (success) {
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified successfully.",
        });
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive"
        });
        setCode('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive"
      });
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setCodeSent(false);
    setCountdown(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="terminal-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono text-matrix flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication Required
          </DialogTitle>
          <DialogDescription className="text-dim-gray">
            For your security, please verify your identity to complete this {operation}
            {amount && ` of ${(amount).toFixed(2)} ${currency}`}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!codeSent ? (
            <>
              <div>
                <Label className="text-light-gray font-mono">Verification Method</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      method === 'email' 
                        ? 'border-matrix bg-matrix/10 text-matrix' 
                        : 'border-dark-terminal text-dim-gray hover:border-matrix/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Email Verification</div>
                        <div className="text-sm opacity-75">Send code to your registered email</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('sms')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      method === 'sms' 
                        ? 'border-matrix bg-matrix/10 text-matrix' 
                        : 'border-dark-terminal text-dim-gray hover:border-matrix/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <div className="font-medium">SMS Verification</div>
                        <div className="text-sm opacity-75">Send code to your phone number</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 border border-amber-600/30 rounded-lg bg-amber-600/10">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-mono text-sm">Security Notice</span>
                </div>
                <p className="text-sm text-dim-gray">
                  This verification is required for all financial operations to protect your account from unauthorized access.
                </p>
              </div>

              <Button 
                onClick={sendVerificationCode}
                className="terminal-button w-full"
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label className="text-light-gray font-mono">Enter Verification Code</Label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="terminal-input mt-2 text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
                <p className="text-sm text-dim-gray mt-2 text-center">
                  Enter the 6-digit code sent to your {method === 'email' ? 'email' : 'phone number'}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-dim-gray">Didn't receive the code?</span>
                {countdown > 0 ? (
                  <span className="text-matrix flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    className="text-matrix hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying || code.length !== 6}
                  className="terminal-button flex-1"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="terminal-button-outline"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
