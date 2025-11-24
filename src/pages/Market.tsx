import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { analyzeMarketOverview, isGeminiConfigured } from "@/services/geminiService";

export default function Market() {
  // Use React Query with caching strategy
  const { data: marketData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["market-overview"],
    queryFn: analyzeMarketOverview,
    staleTime: Infinity, // Data never becomes stale automatically
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 1,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Check if API is configured
  if (!isGeminiConfigured()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Overview</h1>
          <p className="text-muted-foreground mt-1">
            Industry trends, seasonal insights, and demand predictions
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gemini API is not configured. Please add your VITE_GEMINI_API_KEY to the .env file.
          </AlertDescription>
        </Alert>
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

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load market overview. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Market Data Display */}
      {marketData && !isLoading && (
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

          {/* Category Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Category Interest Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketData.categoryTrends}>
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
                  <AreaChart data={marketData.searchInterest}>
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
                {marketData.seasonalInsights.map((insight, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20"
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
          </div>
        </>
      )}
    </div>
  );
}
