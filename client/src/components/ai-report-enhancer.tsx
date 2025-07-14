
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface AIReportEnhancerProps {
  currentReport: {
    title: string;
    type: string;
    severity: string;
    description: string;
  };
  onEnhancedReport: (enhancedReport: {
    title: string;
    type: string;
    severity: string;
    description: string;
  }) => void;
}

export function AIReportEnhancer({ currentReport, onEnhancedReport }: AIReportEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceReport = async () => {
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentReport),
      });
      
      const enhancedReport = await response.json();
      onEnhancedReport(enhancedReport);
    } catch (error) {
      console.error('Failed to enhance report:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="w-full border-matrix/30 hover:bg-matrix/10 text-matrix"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Enhance with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-terminal border border-matrix/30">
        <DialogHeader>
          <DialogTitle className="text-light-gray">AI Report Enhancement</DialogTitle>
          <DialogDescription className="text-dim-gray">
            The AI will analyze and improve your report's structure, clarity, and technical details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            onClick={enhanceReport}
            disabled={isEnhancing}
            className="w-full"
          >
            {isEnhancing ? (
              <>Processing...</>
            ) : (
              <>Enhance Report</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
