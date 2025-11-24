import { useState } from "react";
import { Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles, Search, TrendingUp as TrendingUpIcon } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { AISuggestionCard } from "@/components/AISuggestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryCard } from "@/components/InventoryCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const stockData = [
  { name: "Gold", value: 45 },
  { name: "Silver", value: 30 },
  { name: "Diamond", value: 15 },
  { name: "Platinum", value: 10 },
];

// Simplified inventory data for popup
const topInventoryItems = [
  {
    category: "Gold Chains",
    icon: "🔗",
    stockCount: 156,
    sales30d: 48,
    ageing: 12,
    deadstockRisk: "low" as const,
    reorderSuggestion: true,
    confidence: 92,
    trend: "rising" as const,
  },
  {
    category: "Diamond Earrings",
    icon: "💎",
    stockCount: 89,
    sales30d: 12,
    ageing: 45,
    deadstockRisk: "medium" as const,
    reorderSuggestion: false,
    confidence: 78,
    trend: "falling" as const,
  },
  {
    category: "Silver Bangles",
    icon: "⚪",
    stockCount: 234,
    sales30d: 18,
    ageing: 67,
    deadstockRisk: "high" as const,
    reorderSuggestion: false,
    confidence: 85,
    trend: "falling" as const,
  },
  {
    category: "Gold Necklaces",
    icon: "📿",
    stockCount: 112,
    sales30d: 35,
    ageing: 18,
    deadstockRisk: "low" as const,
    reorderSuggestion: true,
    confidence: 88,
    trend: "rising" as const,
  },
];

// Market trends data for popup
const trendingCategories = [
  { name: "Lightweight Gold Chains", trend: "up", change: "+24%", color: "text-success" },
  { name: "Diamond Studs", trend: "up", change: "+18%", color: "text-success" },
  { name: "Temple Jewellery", trend: "up", change: "+15%", color: "text-success" },
  { name: "Silver Anklets", trend: "down", change: "-8%", color: "text-destructive" },
];

const marketTrendData = [
  { month: "Jan", gold: 45, silver: 30, diamond: 15 },
  { month: "Feb", gold: 52, silver: 28, diamond: 18 },
  { month: "Mar", gold: 48, silver: 32, diamond: 22 },
  { month: "Apr", gold: 61, silver: 35, diamond: 25 },
];

// Keywords data for popup
const keywordSampleData = [
  { month: "Jan", searches: 45 },
  { month: "Feb", searches: 52 },
  { month: "Mar", searches: 48 },
  { month: "Apr", searches: 61 },
];

const relatedSearches = [
  "gold chain designs",
  "22kt gold chain price",
  "lightweight gold chains for women",
  "gold chain with pendant",
];

export default function Dashboard() {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const [keywordQuery, setKeywordQuery] = useState("gold chain");
  const [hasSearched, setHasSearched] = useState(false);

  const handleKeywordSearch = () => {
    setHasSearched(true);
  };

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
            <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
              <DialogTrigger asChild>
                <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
                  <p className="font-semibold text-foreground mb-1">View Inventory</p>
                  <p className="text-xs text-muted-foreground">
                    Check stock levels and ageing
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Inventory Overview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Key inventory items with stock levels, sales velocity, and ageing metrics
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {topInventoryItems.map((item) => (
                      <InventoryCard key={item.category} {...item} />
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={marketOpen} onOpenChange={setMarketOpen}>
              <DialogTrigger asChild>
                <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
                  <p className="font-semibold text-foreground mb-1">Market Trends</p>
                  <p className="text-xs text-muted-foreground">
                    See what's trending now
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Market Trends</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trending in Indian Jewellery Market</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {trendingCategories.map((category) => (
                          <div
                            key={category.name}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {category.trend === "up" ? (
                                <TrendingUpIcon className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-sm font-medium text-foreground">{category.name}</span>
                            </div>
                            <Badge variant={category.trend === "up" ? "default" : "destructive"}>
                              {category.change}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Interest Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={marketTrendData}>
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
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={keywordsOpen} onOpenChange={setKeywordsOpen}>
              <DialogTrigger asChild>
                <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
                  <p className="font-semibold text-foreground mb-1">Keyword Search</p>
                  <p className="text-xs text-muted-foreground">
                    Research market demand
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Keyword Intelligence</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Enter keyword (e.g., gold chain, diamond earrings)..."
                            className="pl-9"
                            value={keywordQuery}
                            onChange={(e) => setKeywordQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
                          />
                        </div>
                        <Button onClick={handleKeywordSearch}>
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {hasSearched && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Interest Over Time: "{keywordQuery}"</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={keywordSampleData}>
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
                                dataKey="searches"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Related Search Phrases</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {relatedSearches.map((search, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                  <TrendingUpIcon className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-foreground">{search}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-primary/20 bg-primary/5">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <span>AI Recommendation</span>
                              <Badge>92% Confidence</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2 text-sm">
                                High Demand Detected
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Search interest for "{keywordQuery}" has grown 34% in the last quarter. 
                                This indicates strong market demand.
                              </p>
                            </div>
                            <div className="pt-2">
                              <p className="text-xs font-semibold text-foreground">
                                Potential Impact: <span className="text-success">High</span>
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
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
