import React from 'react';
import { Link } from 'wouter'; //This import is needed from the original code
import MatrixBackground from "@/components/matrix-background";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-deep-black relative flex items-center justify-center">
      <MatrixBackground />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-6xl font-mono font-bold text-matrix mb-4">404</h1>
        <p className="text-xl text-light-gray mb-6">Page not found in the matrix</p>
        <p className="text-dim-gray mb-8">The page you're looking for doesn't exist or has been moved</p>
        <Link href="/" className="inline-block">
          <Button className="bg-matrix hover:bg-matrix/80 text-black">
            Return to Base
          </Button>
        </Link>
      </div>
    </div>
  );
}