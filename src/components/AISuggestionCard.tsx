import { useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AISuggestionCardProps {
  title: string;
  reason: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  category?: string;
}

export const AISuggestionCard = ({
  title,
  reason,
  confidence,
  impact,
  category,
}: AISuggestionCardProps) => {
  const [isRead, setIsRead] = useState(false);

  const getImpactColor = () => {
    switch (impact) {
      case "high":
        return "bg-success/10 text-success border-success/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getImpactIcon = () => {
    switch (impact) {
      case "high":
        return TrendingUp;
      case "medium":
        return Sparkles;
      case "low":
        return AlertCircle;
    }
  };

  const ImpactIcon = getImpactIcon();

  const handleMarkAsRead = () => {
    setIsRead(true);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      isRead && "opacity-75 border-primary/30"
    )}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          <Badge className={cn("border", getImpactColor())}>
            <ImpactIcon className="mr-1 h-3 w-3" />
            {impact} impact
          </Badge>
        </div>

        {/* Reason */}
        <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Confidence</span>
            <span className="font-semibold text-foreground">{confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <Button 
          className="w-full" 
          size="sm"
          variant={isRead ? "secondary" : "default"}
          onClick={handleMarkAsRead}
          disabled={isRead}
        >
          {isRead ? (
            <>
              <Check className="h-4 w-4" />
              Marked as read
            </>
          ) : (
            "Mark as read"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
