import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { analyzeMarketOverview, isGeminiConfigured } from "@/services/geminiService";
import { apiService } from "@/services/apiService";

export default function Market() {
  // Fetch real market trends from API
  const { data: marketTrends, isLoading: trendsLoading, error: trendsError } = useQuery({
    queryKey: ['market-trends'],
    queryFn: () => apiService.fetchMarketTrends(),
    staleTime: 5 * 60 * 1000,
  });

  // Optional: Keep Gemini AI insights as supplementary
  const { data: marketData, isLoading: aiLoading, error: aiError, refetch, isFetching } = useQuery({
    queryKey: ["market-overview"],
    queryFn: analyzeMarketOverview,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: isGeminiConfigured(), // Only run if API is configured
  });

  const isLoading = trendsLoading;
  const error = trendsError;

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Error loading market data: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Overview</h1>
          <p className="text-muted-foreground mt-1">
            Industry trends, seasonal insights, and demand predictions
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading || isFetching}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Real Market Trends */}
      {marketTrends && (
        <>
          {/* Trending Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Trending in Indian Jewellery Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.trendingCategories.map((category) => (
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

          {/* Category Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Total Sales') return `₹${(value / 10000000).toFixed(2)}Cr`;
                      if (name === 'Turnover Days') return `${value.toFixed(0)} days`;
                      return `${value.toFixed(0)}%`;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total_sales"
                    fill="hsl(var(--primary))"
                    name="Total Sales"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="risk"
                    fill="hsl(var(--destructive))"
                    name="Risk Score"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Turnover Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value: any) => `${value.toFixed(1)} days`}
                    />
                    <Area
                      type="monotone"
                      dataKey="turnover_days"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      name="Days to Sell"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketTrends.slice(0, 3).map((cat: any, index: number) => {
                  const insights = [
                    { emoji: "💰", title: "Highest Sales", cat: marketTrends.reduce((prev: any, curr: any) => prev.total_sales > curr.total_sales ? prev : curr) },
                    { emoji: "⚡", title: "Fastest Moving", cat: marketTrends.reduce((prev: any, curr: any) => prev.turnover_days < curr.turnover_days ? prev : curr) },
                    { emoji: "⚠️", title: "Highest Risk", cat: marketTrends.reduce((prev: any, curr: any) => prev.risk > curr.risk ? prev : curr) },
                  ];
                  
                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <p className="font-semibold text-foreground mb-1">
                        {insights[index].emoji} {insights[index].title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {insights[index].cat.category} - ₹{(insights[index].cat.avg_sales / 100000).toFixed(2)}L avg
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Optional: AI Insights if available */}
          {marketData && !aiLoading && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Market Insights</CardTitle>
                  <Button
                    onClick={handleRefresh}
                    disabled={isFetching}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketData.seasonalInsights?.map((insight: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-accent/10 border border-accent/20"
                  >
                    <p className="font-semibold text-foreground mb-1">
                      {insight.emoji} {insight.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
