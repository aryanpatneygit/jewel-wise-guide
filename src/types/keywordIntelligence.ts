export interface InterestDataPoint {
  month: string;
  searches: number;
}

export interface RelatedSearch {
  query: string;
  category: string;
  demand: "Low" | "Medium" | "High" | "Very High";
}

export interface AIRecommendation {
  confidence: number;
  summary: string;
  insights: string[];
  potentialImpact: "Low" | "Medium" | "High";
}

export interface CategoryDemand {
  category: string;
  level: "Low" | "Medium" | "High" | "Very High";
  percentage: number;
}

export interface KeywordAnalysis {
  keyword: string;
  isTrending: boolean;
  trendDirection?: "up" | "down" | "stable";
  interestOverTime: InterestDataPoint[];
  relatedSearches: RelatedSearch[];
  aiRecommendation: AIRecommendation;
  categoryDemand: CategoryDemand[];
}

