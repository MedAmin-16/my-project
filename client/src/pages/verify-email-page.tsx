import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatrixBackground } from "@/components/matrix-background";

enum VerificationStatus {
  VERIFYING = "verifying",
  SUCCESS = "success",
  ERROR = "error",
}

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.VERIFYING);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [, setLocation] = useLocation();

  // Extract the token from the URL query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setStatus(VerificationStatus.ERROR);
          setErrorMessage("Verification token is missing.");
          return;
        }

        // Send the token to the backend for verification
        const response = await apiRequest("GET", `/api/verify-email?token=${token}`);
        
        if (response.ok) {
          // If verification successful, send welcome email
          try {
            await apiRequest("POST", "/api/send-welcome-email");
          } catch (welcomeError) {
            console.error("Error sending welcome email:", welcomeError);
            // Continue with success flow even if welcome email fails
          }
          
          setStatus(VerificationStatus.SUCCESS);
        } else {
          const data = await response.json();
          setStatus(VerificationStatus.ERROR);
          setErrorMessage(data.message || "Failed to verify email.");
        }
      } catch (error) {
        console.error("Error during email verification:", error);
        setStatus(VerificationStatus.ERROR);
        setErrorMessage("An error occurred during verification. Please try again later.");
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.VERIFYING:
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="h-16 w-16 text-matrix animate-spin" />
            <h2 className="text-xl font-mono text-matrix animate-pulse">Verifying Email...</h2>
            <p className="text-dim-gray text-center">
              Please wait while we verify your email address
            </p>
          </div>
        );

      case VerificationStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-black font-bold text-xs">+10</span>
              </div>
            </div>
            <h2 className="text-2xl font-mono text-matrix">Email Verified!</h2>
            <div className="text-dim-gray text-center space-y-3">
              <p>
                <span className="text-green-400">Success!</span> Your email has been verified and your account is now fully activated.
              </p>
              <p>
                You've received <span className="text-yellow-400">10 reputation points</span> for completing this important security step.
              </p>
              <p className="text-blue-400">
                Check your inbox for a welcome email with helpful tips to get started.
              </p>
            </div>
            <div className="w-full space-y-3">
              <Button className="glow-button w-full" onClick={() => setLocation("/dashboard")}>
                Continue to Dashboard
              </Button>
              <p className="text-xs text-dim-gray text-center mt-2">
                You can now access all features of the platform
              </p>
            </div>
          </div>
        );

      case VerificationStatus.ERROR:
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-mono text-alert-red">Verification Failed</h2>
            <p className="text-dim-gray text-center">{errorMessage}</p>
            <div className="flex flex-col w-full space-y-3">
              <Button className="glow-button-secondary w-full" onClick={() => setLocation("/auth")}>
                Back to Login
              </Button>
              <Button className="glow-button w-full" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MatrixBackground />
      
      <div className="terminal-card w-full max-w-md p-8 rounded-lg relative overflow-hidden z-10">
        <div className="terminal-header mb-6 flex justify-center">
          <h1 className="text-matrix text-3xl font-mono font-bold">Email Verification</h1>
        </div>
        
        {renderContent()}
        
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-matrix/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-electric-blue/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}