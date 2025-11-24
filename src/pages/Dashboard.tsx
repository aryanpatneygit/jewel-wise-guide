import { Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { AISuggestionCard } from "@/components/AISuggestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stockData = [
  { name: "Gold", value: 45 },
  { name: "Silver", value: 30 },
  { name: "Diamond", value: 15 },
  { name: "Platinum", value: 10 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* AI Daily Suggestion - Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-10 shadow-lg border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* Decorative glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
              <span className="text-sm font-semibold text-white">AI Daily Insight</span>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Welcome back, Raj Store
          </h1>
          
          <div className="space-y-3 max-w-3xl">
            <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
              Your gold chain inventory is moving faster than expected. Consider restocking by next week.
            </p>
            <p className="text-base text-white/90 leading-relaxed">
              Based on current sales velocity and market trends, your gold chain stock will deplete in 8 days. 
              Diamond earrings are showing low movement—review pricing strategy to improve turnover.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Stock Value"
          value="₹48.5L"
          change="+5.2% from last month"
          changeType="positive"
          icon={Package}
        />
        <KPICard
          title="Ageing Stock"
          value="₹12.3L"
          change="23% of total inventory"
          changeType="neutral"
          icon={TrendingDown}
          iconBg="bg-warning/10"
        />
        <KPICard
          title="Predicted Deadstock"
          value="₹4.8L"
          change="-12% vs last period"
          changeType="positive"
          icon={AlertTriangle}
          iconBg="bg-destructive/10"
        />
        <KPICard
          title="Fast Moving Items"
          value="42"
          change="8 items added this week"
          changeType="positive"
          icon={TrendingUp}
          iconBg="bg-success/10"
        />
      </div>

      {/* Charts & AI Suggestions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stock Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <p className="font-semibold text-foreground mb-1">View Inventory</p>
              <p className="text-xs text-muted-foreground">
                Check stock levels and ageing
              </p>
            </button>
            <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <p className="font-semibold text-foreground mb-1">Market Trends</p>
              <p className="text-xs text-muted-foreground">
                See what's trending now
              </p>
            </button>
            <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <p className="font-semibold text-foreground mb-1">Keyword Search</p>
              <p className="text-xs text-muted-foreground">
                Research market demand
              </p>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          AI Recommendations
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AISuggestionCard
            title="Restock Gold Chains"
            reason="Sales velocity is 3x higher than average. Current stock will deplete in 8 days based on trend analysis."
            confidence={92}
            impact="high"
            category="Gold"
          />
          <AISuggestionCard
            title="Review Diamond Earrings Pricing"
            reason="Low turnover rate detected. Competitor analysis shows 12% price gap. Consider promotional strategy."
            confidence={78}
            impact="medium"
            category="Diamond"
          />
          <AISuggestionCard
            title="Clear Silver Bangles Stock"
            reason="Ageing inventory with declining market interest. Recommend clearance sale to free up capital."
            confidence={85}
            impact="medium"
            category="Silver"
          />
        </div>
      </div>
    </div>
  );
}
