
import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Info } from 'lucide-react';

export function SecurityNotice() {
  return (
    <Alert className="border-blue-600/30 bg-blue-600/10 mb-6">
      <Shield className="h-4 w-4 text-blue-400" />
      <AlertDescription className="text-blue-400">
        <strong>Enhanced Security:</strong> Two-Factor Authentication (2FA) is now required for all financial operations including deposits and withdrawals to protect your account from unauthorized access.
      </AlertDescription>
    </Alert>
  );
}
