import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  TrendingUp,
  Search,
  FolderTree,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface LoadingStage {
  id: number;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  progress: number;
}

const LOADING_STAGES: LoadingStage[] = [
  {
    id: 1,
    message: "Initializing analysis...",
    icon: Loader2,
    progress: 14,
  },
  {
    id: 2,
    message: "Collecting market data...",
    icon: Database,
    progress: 28,
  },
  {
    id: 3,
    message: "Analyzing search trends...",
    icon: TrendingUp,
    progress: 42,
  },
  {
    id: 4,
    message: "Identifying related searches...",
    icon: Search,
    progress: 56,
  },
  {
    id: 5,
    message: "Building category insights...",
    icon: FolderTree,
    progress: 70,
  },
  {
    id: 6,
    message: "Generating AI recommendations...",
    icon: Sparkles,
    progress: 85,
  },
  {
    id: 7,
    message: "Finalizing results...",
    icon: CheckCircle2,
    progress: 99,
  },
];

interface LoadingProgressProps {
  keyword?: string;
  isComplete?: boolean;
}

export default function LoadingProgress({ keyword, isComplete }: LoadingProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset when component mounts
    setCurrentStageIndex(0);
    setProgress(0);

    // Complete in 40 seconds and stay at 99%
    const totalDuration = 40000; // 40 seconds total
    const stageCount = LOADING_STAGES.length;
    const stageDuration = totalDuration / stageCount; // ~5.7 seconds per stage

    // Stage transition timer
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stageDuration);

    // Smooth progress animation - progress to 99% over 40 seconds
    const maxProgress = 99;
    const updateInterval = 100; // Update every 100ms
    const totalUpdates = totalDuration / updateInterval; // 400 updates
    const incrementPerUpdate = maxProgress / totalUpdates; // ~0.2475 per update

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < maxProgress) {
          return Math.min(prev + incrementPerUpdate, maxProgress);
        }
        return maxProgress; // Stay at 99%
      });
    }, updateInterval);

    return () => {
      clearInterval(stageTimer);
      clearInterval(progressInterval);
    };
  }, []); // Empty dependency array - only run once on mount

  // When API completes, quickly jump to 100%
  useEffect(() => {
    if (isComplete) {
      // Jump to final stage
      setCurrentStageIndex(LOADING_STAGES.length - 1);
      
      // Quickly animate to 100%
      const quickCompleteInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) {
            return Math.min(prev + 5, 100); // Increment by 5% for quick completion
          }
          return 100;
        });
      }, 50); // Update every 50ms for fast animation

      // Clear after a short time
      setTimeout(() => {
        clearInterval(quickCompleteInterval);
        setProgress(100);
      }, 500);

      return () => clearInterval(quickCompleteInterval);
    }
  }, [isComplete]);

  const currentStage = LOADING_STAGES[currentStageIndex];
  const CurrentIcon = currentStage.icon;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-8 pb-8">
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CurrentIcon className="h-6 w-6 text-primary animate-pulse" />
              <h3 className="text-xl font-semibold text-foreground">
                Analyzing Keyword Intelligence
              </h3>
            </div>
            {keyword && (
              <p className="text-sm text-muted-foreground">
                Processing: <span className="font-medium text-foreground">"{keyword}"</span>
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                {currentStage.message}
              </span>
              <span className="text-primary font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="grid grid-cols-7 gap-2">
            {LOADING_STAGES.map((stage, index) => {
              const StageIcon = stage.icon;
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              
              return (
                <div
                  key={stage.id}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isCurrent ? "scale-110" : "scale-100"
                  }`}
                >
                  <div
                    className={`rounded-full p-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary/20 text-primary"
                        : isCurrent
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <StageIcon className="h-4 w-4" />
                  </div>
                  <div
                    className={`h-1 w-full rounded-full transition-all duration-300 ${
                      isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Estimated Time */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This may take up to 2 minutes. Please wait while we gather comprehensive insights...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

