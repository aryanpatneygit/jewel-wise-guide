import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InventoryCard } from "@/components/InventoryCard";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { apiService, type InventoryCategory } from "@/services/apiService";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { formatIndianCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Map category names to appropriate icons
const getCategoryIcon = (category: string): string => {
  const categoryUpper = category.toUpperCase();
  if (categoryUpper.includes("CHAIN")) return "🔗";
  if (categoryUpper.includes("EARRING")) return "💎";
  if (categoryUpper.includes("BANGLE")) return "⚪";
  if (categoryUpper.includes("RING")) return "💍";
  if (categoryUpper.includes("NECKLACE")) return "📿";
  if (categoryUpper.includes("BRACELET")) return "✨";
  if (categoryUpper.includes("PENDANT")) return "🔸";
  return "💍"; // Default icon
};

// Map risk score to risk level
const getRiskLevel = (riskScore: number): "low" | "medium" | "high" => {
  if (riskScore < 33) return "low";
  if (riskScore < 66) return "medium";
  return "high";
};

// Calculate confidence based on risk score (inverse relationship)
const getConfidence = (riskScore: number): number => {
  return Math.round(100 - riskScore);
};

// Transform API data to InventoryCard props
const transformInventoryData = (data: InventoryCategory[]) => {
  return data.map((item) => ({
    category: item.category.charAt(0) + item.category.slice(1).toLowerCase(),
    icon: getCategoryIcon(item.category),
    stockCount: item.itemCount,
    sales30d: formatIndianCurrency(item.stockValue).replace('₹', ''), // Remove ₹ symbol as it's just a value display
    ageing: Math.round(item.avgDaysToSell),
    deadstockRisk: getRiskLevel(item.riskScore),
    reorderSuggestion: item.trend === "rising" && item.riskScore < 40,
    confidence: getConfidence(item.riskScore),
    trend: item.trend,
  }));
};

export default function Inventory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { getDateRange } = useDateFilter();
  
  // Get date range for API calls
  const { startDate, endDate } = getDateRange();

  // Fetch real inventory data from backend with date filter
  const { data: inventoryCategories, isLoading, error } = useQuery({
    queryKey: ["inventory-categories", startDate, endDate],
    queryFn: () => apiService.fetchInventoryCategories(startDate, endDate),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Transform and filter inventory data
  const inventoryItems = useMemo(() => {
    if (!inventoryCategories) return [];
    const transformed = transformInventoryData(inventoryCategories);
    
    if (!searchQuery.trim()) return transformed;
    
    return transformed.filter((item) =>
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryCategories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor stock levels, sales velocity, and AI-powered restock suggestions
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load inventory data. Please make sure the backend is running.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {/* Inventory Cards */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inventoryItems.length > 0 ? (
            inventoryItems.map((item) => {
              const isBracelet = item.category.toLowerCase().includes("bracelet");
              return (
                <div
                  key={item.category}
                  onClick={() => {
                    if (isBracelet) {
                      navigate("/inventory/bracelets");
                    }
                  }}
                  className={isBracelet ? "cursor-pointer transition-transform hover:scale-105" : ""}
                >
                  <InventoryCard {...item} />
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No categories found matching your search." : "No inventory data available."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
