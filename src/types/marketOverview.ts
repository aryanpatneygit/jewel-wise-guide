export interface TrendingCategory {
  name: string;
  trend: "up" | "down";
  change: string; // e.g., "+24%", "-8%"
}

export interface CategoryTrendDataPoint {
  month: string;
  gold: number;
  silver: number;
  diamond: number;
}

export interface InterestDataPoint {
  week: string;
  interest: number;
}

export interface SeasonalInsight {
  title: string;
  description: string;
  emoji: string;
}

export interface MarketOverview {
  trendingCategories: TrendingCategory[];
  categoryTrends: CategoryTrendDataPoint[];
  searchInterest: InterestDataPoint[];
  seasonalInsights: SeasonalInsight[];
  lastUpdated: string; // ISO timestamp
}

