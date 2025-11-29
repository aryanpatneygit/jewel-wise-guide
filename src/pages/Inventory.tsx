import { InventoryCard } from "@/components/InventoryCard";
import { Input } from "@/components/ui/input";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { useFilter } from "@/contexts/FilterContext";
=======
import { Search } from "lucide-react";
>>>>>>> parent of 2819360 (feat: Integrate ML models with JewelAI frontend (Phases 1-4))

const inventoryItems = [
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
    category: "Platinum Rings",
    icon: "💍",
    stockCount: 45,
    sales30d: 8,
    ageing: 23,
    deadstockRisk: "low" as const,
    reorderSuggestion: false,
    confidence: 72,
    trend: "stable" as const,
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
  {
    category: "Diamond Rings",
    icon: "💎",
    stockCount: 67,
    sales30d: 22,
    ageing: 29,
    deadstockRisk: "medium" as const,
    reorderSuggestion: false,
    confidence: 81,
    trend: "stable" as const,
  },
];

export default function Inventory() {
<<<<<<< HEAD
  const { timePeriod } = useFilter();
  const timePeriodDays = parseInt(timePeriod);

  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory', timePeriodDays],
    queryFn: () => apiService.fetchInventoryCategories(timePeriodDays),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error || !inventory) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Error loading inventory: {error?.message || 'No data available'}</p>
        </div>
      </div>
    );
  }
  const handleExport = () => {
    if (!inventory) return;
    
    const csv = [
      ['Category', 'Stock Value (₹)', 'Items', 'Avg Days to Sell', 'Risk Score (%)', 'Trend'],
      ...inventory.map(item => [
        item.category,
        item.stockValue.toFixed(2),
        item.itemCount,
        item.avgDaysToSell.toFixed(1),
        item.riskScore.toFixed(1),
        item.trend
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

=======
>>>>>>> parent of 2819360 (feat: Integrate ML models with JewelAI frontend (Phases 1-4))
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
          />
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventoryItems.map((item) => (
          <InventoryCard key={item.category} {...item} />
        ))}
      </div>
    </div>
  );
}
