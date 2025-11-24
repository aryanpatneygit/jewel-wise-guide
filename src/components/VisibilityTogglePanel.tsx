import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CardVisibility {
  id: string;
  label: string;
  visible: boolean;
}

interface VisibilityTogglePanelProps {
  cards: CardVisibility[];
  onToggle: (id: string) => void;
}

export const VisibilityTogglePanel = ({ cards, onToggle }: VisibilityTogglePanelProps) => {
  // Group cards by type
  const kpiCards = cards.filter(c => c.id.startsWith("kpi-"));
  const chartCards = cards.filter(c => !c.id.startsWith("kpi-") && !c.id.startsWith("analytics-") && c.id !== "ai-recommendations" && c.id !== "quick-actions");
  const otherCards = cards.filter(c => c.id === "ai-recommendations" || c.id === "quick-actions");
  const analyticsCards = cards.filter(c => c.id.startsWith("analytics-"));

  return (
    <Card className="mb-6 border-2 border-primary/20">
      <CardHeader>
        <CardTitle>Toggle Dashboard Elements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Cards Section */}
        {kpiCards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">KPI Cards</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={card.id}
                    checked={card.visible}
                    onCheckedChange={() => onToggle(card.id)}
                  />
                  <Label
                    htmlFor={card.id}
                    className="text-sm font-medium text-foreground cursor-pointer flex-1"
                  >
                    {card.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartCards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Charts</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {chartCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={card.id}
                    checked={card.visible}
                    onCheckedChange={() => onToggle(card.id)}
                  />
                  <Label
                    htmlFor={card.id}
                    className="text-sm font-medium text-foreground cursor-pointer flex-1"
                  >
                    {card.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Cards Section */}
        {otherCards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Other</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {otherCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={card.id}
                    checked={card.visible}
                    onCheckedChange={() => onToggle(card.id)}
                  />
                  <Label
                    htmlFor={card.id}
                    className="text-sm font-medium text-foreground cursor-pointer flex-1"
                  >
                    {card.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Modules Section */}
        {analyticsCards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Analytics Modules</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {analyticsCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={card.id}
                    checked={card.visible}
                    onCheckedChange={() => onToggle(card.id)}
                  />
                  <Label
                    htmlFor={card.id}
                    className="text-sm font-medium text-foreground cursor-pointer flex-1"
                  >
                    {card.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

