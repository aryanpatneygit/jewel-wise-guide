import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Minus, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyzeKeyword, isGeminiConfigured } from "@/services/geminiService";
import LoadingProgress from "@/components/LoadingProgress";

export default function Keywords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // Use React Query for data fetching and caching
  const { data: analysis, isLoading, error, refetch } = useQuery({
    queryKey: ["keyword-analysis", activeKeyword],
    queryFn: () => analyzeKeyword(activeKeyword),
    enabled: !!activeKeyword,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Track when loading completes
  useEffect(() => {
    if (!isLoading && analysis) {
      setIsLoadingComplete(true);
      // Reset after a short delay to allow animation
      const timer = setTimeout(() => setIsLoadingComplete(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, analysis]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsLoadingComplete(false);
      setActiveKeyword(searchQuery.trim());
    }
  };

  // Check if API is configured
  if (!isGeminiConfigured()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Keyword Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Research market demand and search trends for jewellery products
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Keyword Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Research market demand and search trends for jewellery products
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter keyword (e.g., gold chain, diamond earrings)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to analyze keyword. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && <LoadingProgress keyword={activeKeyword} isComplete={isLoadingComplete} />}

      {/* Results */}
      {analysis && !isLoading && (
        <>
          {/* Trending Status Banner */}
          <Card className={analysis.isTrending ? "border-primary bg-primary/5" : "border-muted"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {analysis.trendDirection === "up" && (
                    <TrendingUp className="h-8 w-8 text-success" />
                  )}
                  {analysis.trendDirection === "down" && (
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  )}
                  {analysis.trendDirection === "stable" && (
                    <Minus className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {analysis.keyword}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {analysis.isTrending ? "Currently Trending" : "Standard Search Volume"}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={analysis.isTrending ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {analysis.trendDirection === "up" && "Trending Up"}
                  {analysis.trendDirection === "down" && "Trending Down"}
                  {analysis.trendDirection === "stable" && "Stable"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Interest Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Interest Over Time: "{analysis.keyword}"</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysis.interestOverTime}>
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

          {/* Insights Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Related Searches */}
            <Card>
              <CardHeader>
                <CardTitle>Related Search Phrases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.relatedSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{search.query}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {search.category}
                        </Badge>
                        <Badge 
                          variant={
                            search.demand === "Very High" ? "default" :
                            search.demand === "High" ? "secondary" :
                            "outline"
                          }
                          className="text-xs"
                        >
                          {search.demand}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>AI Recommendation</span>
                  <Badge>{analysis.aiRecommendation.confidence}% Confidence</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Market Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.aiRecommendation.summary}
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {analysis.aiRecommendation.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-foreground">
                    Potential Impact:{" "}
                    <span 
                      className={
                        analysis.aiRecommendation.potentialImpact === "High" 
                          ? "text-success" 
                          : analysis.aiRecommendation.potentialImpact === "Medium"
                          ? "text-warning"
                          : "text-muted-foreground"
                      }
                    >
                      {analysis.aiRecommendation.potentialImpact}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Category-Level Demand Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.categoryDemand.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {category.category}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {category.level}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${
                          category.level === "Very High" ? "bg-primary" :
                          category.level === "High" ? "bg-success" :
                          category.level === "Medium" ? "bg-warning" :
                          "bg-muted-foreground"
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
