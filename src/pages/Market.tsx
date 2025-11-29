import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const trendData = [
  { month: "Jan", gold: 45, silver: 30, diamond: 15 },
  { month: "Feb", gold: 52, silver: 28, diamond: 18 },
  { month: "Mar", gold: 48, silver: 32, diamond: 22 },
  { month: "Apr", gold: 61, silver: 35, diamond: 25 },
  { month: "May", gold: 55, silver: 38, diamond: 28 },
  { month: "Jun", gold: 67, silver: 42, diamond: 32 },
];

const interestData = [
  { week: "W1", interest: 65 },
  { week: "W2", interest: 72 },
  { week: "W3", interest: 68 },
  { week: "W4", interest: 85 },
  { week: "W5", interest: 78 },
  { week: "W6", interest: 92 },
];

const trendingCategories = [
  { name: "Lightweight Gold Chains", trend: "up", change: "+24%", color: "text-success" },
  { name: "Diamond Studs", trend: "up", change: "+18%", color: "text-success" },
  { name: "Temple Jewellery", trend: "up", change: "+15%", color: "text-success" },
  { name: "Silver Anklets", trend: "down", change: "-8%", color: "text-destructive" },
];

export default function Market() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Market Overview</h1>
        <p className="text-muted-foreground mt-1">
          Industry trends, seasonal insights, and demand predictions
        </p>
      </div>

      {/* Trending Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Trending in Indian Jewellery Market</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingCategories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {category.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <Badge variant={category.trend === "up" ? "default" : "destructive"}>
                  {category.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Category Interest Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="gold"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Gold"
              />
              <Line
                type="monotone"
                dataKey="silver"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Silver"
              />
              <Line
                type="monotone"
                dataKey="diamond"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name="Diamond"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demand Prediction */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Interest Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={interestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seasonal Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-foreground mb-1">
                🎉 Wedding Season Approaching
              </p>
              <p className="text-sm text-muted-foreground">
                Expect 40% spike in bridal jewellery demand in next 6 weeks
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <p className="font-semibold text-foreground mb-1">
                🪔 Festival Season Preparation
              </p>
              <p className="text-sm text-muted-foreground">
                Gold purchases typically increase 25% during Diwali period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
