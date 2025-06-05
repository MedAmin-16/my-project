
import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { AlertCircle } from "lucide-react";

interface BugPriceEstimatorProps {
  bugType: string;
  severity: string;
  programId: number;
}

export function BugPriceEstimator({ bugType, severity, programId }: BugPriceEstimatorProps) {
  const [estimate, setEstimate] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (!bugType || !severity) return;

    // Base multipliers for bug types
    const typeMultipliers: Record<string, number> = {
      "Remote Code Execution (RCE)": 5.0,
      "SQL Injection": 4.0,
      "Authentication Bypass": 3.5,
      "Authorization Bypass": 3.0,
      "Cross-Site Scripting (XSS)": 2.0,
      "Cross-Site Request Forgery (CSRF)": 1.5,
      "Information Disclosure": 1.5,
      "Server-Side Request Forgery (SSRF)": 2.5,
      "XML External Entity (XXE)": 2.5,
      "Open Redirect": 1.0,
      "Business Logic Vulnerability": 2.0,
      "Other": 1.0
    };

    // Severity multipliers
    const severityMultipliers: Record<string, number> = {
      "Critical": 4.0,
      "High": 3.0,
      "Medium": 2.0,
      "Low": 1.0,
      "Info": 0.5
    };

    // Base reward ranges
    const baseMin = 100;
    const baseMax = 500;

    // Calculate estimate
    const typeMultiplier = typeMultipliers[bugType] || 1;
    const severityMultiplier = severityMultipliers[severity] || 1;

    const minReward = Math.round(baseMin * typeMultiplier * severityMultiplier);
    const maxReward = Math.round(baseMax * typeMultiplier * severityMultiplier);

    setEstimate({ min: minReward, max: maxReward });
  }, [bugType, severity, programId]);

  if (!bugType || !severity) return null;

  return (
    <Card className="bg-terminal border border-matrix/20">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <AlertCircle className="h-5 w-5 text-matrix mt-0.5" />
          <div>
            <h4 className="text-sm font-medium mb-1">Estimated Reward Range</h4>
            <p className="text-2xl font-mono text-matrix">
              ${estimate.min} - ${estimate.max}
            </p>
            <p className="text-xs text-dim-gray mt-1">
              *This is an estimate. Actual reward may vary based on impact and other factors.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
