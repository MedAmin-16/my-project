import React from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import MatrixBackground from "../components/matrix-background";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
      <MatrixBackground />
      
      <div className="z-10 max-w-md w-full space-y-8 p-8 bg-card/80 backdrop-blur-md rounded-lg border border-primary/30 shadow-lg neon-border">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-20 w-20 text-destructive" />
            <AlertTriangle className="h-20 w-20 text-destructive animate-pulse" />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary neon-text">
            <span className="glitch" data-text="404 Access Denied">404 Access Denied</span>
          </h2>
          
          <p className="mt-4 text-lg text-foreground">
            Unauthorized access detected. The target page does not exist or requires higher security clearance.
          </p>
          
          <div className="mt-4">
            <div className="inline-block terminal-text border border-primary/50 bg-muted p-3 text-sm rounded">
              <span className="text-primary">$</span> <span className="typing-effect">access --route="/404" --status="failed"</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="mr-4 border-primary text-primary hover:bg-primary/10">
            <Link to="/">Return to Home</Link>
          </Button>
          
          <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}