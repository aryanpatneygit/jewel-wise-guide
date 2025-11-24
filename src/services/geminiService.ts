import { GoogleGenerativeAI } from "@google/generative-ai";
import { KeywordAnalysis } from "@/types/keywordIntelligence";

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
 * Check if the Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!apiKey && !!genAI;
}

