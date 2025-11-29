import { useState } from "react";
import { Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { AISuggestionCard } from "@/components/AISuggestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import Inventory from "@/pages/Inventory";
import Market from "@/pages/Market";
import Keywords from "@/pages/Keywords";

export default function Dashboard() {
  const queryClient = useQueryClient();

  // State for managing modal visibility
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(false);

  // Fetch real data from API
  const { data: kpis, isLoading, error, refetch: refetchKPIs } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => apiService.fetchKPIs(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch inventory categories for stock distribution chart
  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => apiService.fetchInventoryCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = async () => {
    await Promise.all([refetchKPIs(), refetchCategories()]);
  };

  // Transform category data for the chart
  const stockData = categories?.map(cat => ({
    name: cat.category,
    value: Math.round(cat.stockValue / 1000000) // Convert to Millions for better visualization
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Error loading data: {error?.message || 'No data available'}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights from your ML models</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

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
          value={`₹${(kpis.totalStockValue / 10000000).toFixed(2)}Cr`}
          change="+5.2% from last month"
          changeType="positive"
          icon={Package}
        />
        <KPICard
          title="Ageing Stock (90+ days)"
          value={kpis.ageingStock.toString()}
          change={`${((kpis.ageingStock / kpis.totalItems) * 100).toFixed(1)}% of total inventory`}
          changeType="neutral"
          icon={TrendingDown}
          iconBg="bg-warning/10"
        />
        <KPICard
          title="Predicted Deadstock"
          value={kpis.predictedDeadstock.toString()}
          change={`${((kpis.predictedDeadstock / kpis.totalItems) * 100).toFixed(1)}% of items`}
          changeType="positive"
          icon={AlertTriangle}
          iconBg="bg-destructive/10"
        />
        <KPICard
          title="Fast Moving Items"
          value={kpis.fastMovingItems.toString()}
          change={`${((kpis.fastMovingItems / kpis.totalItems) * 100).toFixed(1)}% fast movers`}
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
            <button 
              onClick={() => setInventoryOpen(true)}
              className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <p className="font-semibold text-foreground mb-1">View Inventory</p>
              <p className="text-xs text-muted-foreground">
                Check stock levels and ageing
              </p>
            </button>
            <button 
              onClick={() => setMarketOpen(true)}
              className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <p className="font-semibold text-foreground mb-1">Market Trends</p>
              <p className="text-xs text-muted-foreground">
                See what's trending now
              </p>
            </button>
            <button 
              onClick={() => setKeywordsOpen(true)}
              className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <p className="font-semibold text-foreground mb-1">Keyword Search</p>
              <p className="text-xs text-muted-foreground">
                Research market demand
              </p>
            </button>
          </CardContent>
        </Card>

      {/* Inventory Modal */}
      <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Management</DialogTitle>
          </DialogHeader>
          <Inventory />
        </DialogContent>
      </Dialog>

      {/* Market Trends Modal */}
      <Dialog open={marketOpen} onOpenChange={setMarketOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Market Overview</DialogTitle>
          </DialogHeader>
          <Market />
        </DialogContent>
      </Dialog>

      {/* Keywords Modal */}
      <Dialog open={keywordsOpen} onOpenChange={setKeywordsOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keyword Intelligence</DialogTitle>
          </DialogHeader>
          <Keywords />
        </DialogContent>
      </Dialog>
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
