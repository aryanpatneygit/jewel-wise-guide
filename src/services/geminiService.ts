import { GoogleGenerativeAI } from "@google/generative-ai";
import { KeywordAnalysis } from "@/types/keywordIntelligence";
import { MarketOverview } from "@/types/marketOverview";

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set in environment variables");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Analyzes a keyword using Google Gemini API to provide comprehensive market intelligence
 * @param keyword - The keyword to analyze (e.g., "gold chain", "diamond earrings")
 * @returns Promise with keyword analysis data
 */
export async function analyzeKeyword(keyword: string): Promise<KeywordAnalysis> {
  if (!genAI) {
    throw new Error("Gemini API is not initialized. Please check your API key.");
  }

  // Use gemini-pro-latest which is confirmed to work with this API key
  const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

  const prompt = `You are a market intelligence analyst specializing in the jewelry industry. Analyze the keyword "${keyword}" and provide comprehensive market insights.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Provide your analysis in the following JSON structure:
{
  "keyword": "${keyword}",
  "isTrending": boolean (true if this is a trending search term in jewelry market),
  "trendDirection": "up" | "down" | "stable",
  "interestOverTime": [
    // 12 months of historical search interest data (0-100 scale)
    // Start from 12 months ago to current month
    {"month": "Month Year", "searches": number}
  ],
  "relatedSearches": [
    // 5-7 related search queries with category and demand
    {
      "query": "related search phrase",
      "category": "Product Type" (e.g., "Chains", "Gold Jewelry", "Design Styles"),
      "demand": "Low" | "Medium" | "High" | "Very High"
    }
  ],
  "aiRecommendation": {
    "confidence": number (85-95 for strong signals, 70-84 for moderate, 60-69 for weak),
    "summary": "Brief analysis of market demand and trend direction",
    "insights": [
      // 3-4 actionable business insights or recommendations
      "Specific actionable insight"
    ],
    "potentialImpact": "Low" | "Medium" | "High"
  },
  "categoryDemand": [
    // 3-4 category-level demand metrics
    {
      "category": "Category name",
      "level": "Low" | "Medium" | "High" | "Very High",
      "percentage": number (0-100)
    }
  ]
}

Ensure all data is realistic and relevant to the jewelry industry. Use actual market knowledge and trends when possible. Make the interest over time data show realistic patterns (seasonal variations, growth trends, etc.).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }
    
    // Parse the JSON response
    const analysis: KeywordAnalysis = JSON.parse(jsonText);
    
    // Validate the response has required fields
    if (!analysis.keyword || typeof analysis.isTrending !== "boolean") {
      throw new Error("Invalid response format from Gemini API");
    }
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing keyword with Gemini:", error);
    
    // If parsing fails, try to extract JSON from the text
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse Gemini response. The API may have returned invalid JSON."
      );
    }
    
    throw new Error(
      `Failed to analyze keyword: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Analyzes the Indian jewellery market using Google Gemini API to provide comprehensive market overview
 * @returns Promise with market overview data
 */
export async function analyzeMarketOverview(): Promise<MarketOverview> {
  if (!genAI) {
    throw new Error("Gemini API is not initialized. Please check your API key.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

  const prompt = `You are a market intelligence analyst specializing in the Indian jewelry industry. Provide a comprehensive market overview with current trends, insights, and predictions.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Provide your analysis in the following JSON structure:
{
  "trendingCategories": [
    // 4-5 trending jewelry categories in the Indian market
    {
      "name": "Category name (e.g., Lightweight Gold Chains, Temple Jewellery)",
      "trend": "up" | "down",
      "change": "percentage string (e.g., +24%, -8%)"
    }
  ],
  "categoryTrends": [
    // 6 months of data showing interest levels for gold, silver, and diamond categories
    // Use realistic 0-100 scale with seasonal patterns
    {
      "month": "Month name (Jan, Feb, Mar, etc.)",
      "gold": number (30-70 range),
      "silver": number (20-50 range),
      "diamond": number (10-35 range)
    }
  ],
  "searchInterest": [
    // 6 weeks of overall search interest data (0-100 scale)
    {
      "week": "Week label (W1, W2, W3, etc.)",
      "interest": number (60-95 range)
    }
  ],
  "seasonalInsights": [
    // 2-3 relevant seasonal insights for the Indian jewelry market
    // IMPORTANT: Only include insights for the next 1 week to 3 months from today. Do NOT include insights beyond 3 months.
    {
      "title": "Brief title",
      "description": "One sentence description of the seasonal trend or prediction occurring within the next 1 week to 3 months only",
      "emoji": "single relevant emoji"
    }
  ],
  "lastUpdated": "${new Date().toISOString()}"
}

Focus on:
- Current Indian jewelry market trends (wedding season, festivals, traditional vs modern designs)
- Realistic data showing gold as most popular, followed by silver and diamond
- Seasonal patterns related to Indian festivals (Diwali, wedding seasons, Akshaya Tritiya)
- Growth trends in lightweight and daily-wear jewelry
- Regional preferences and emerging categories

CRITICAL: For seasonalInsights, ONLY provide insights for events, trends, or predictions happening in the next 1 week to 3 months from today's date. Do NOT include any insights beyond 3 months. Focus on immediate and near-term market opportunities and seasonal events.

Ensure all data is realistic, relevant to the Indian market, and shows meaningful patterns.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }
    
    // Parse the JSON response
    const overview: MarketOverview = JSON.parse(jsonText);
    
    // Validate the response has required fields
    if (!overview.trendingCategories || !overview.categoryTrends || !overview.searchInterest) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    return overview;
  } catch (error) {
    console.error("Error analyzing market overview with Gemini:", error);
    
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse Gemini response. The API may have returned invalid JSON."
      );
    }
    
    throw new Error(
      `Failed to analyze market overview: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Check if the Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!apiKey && !!genAI;
}

