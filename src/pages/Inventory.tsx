import { InventoryCard } from "@/components/InventoryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";

// Category icon mapping
const categoryIcons: Record<string, string> = {
  "GOLD RINGS": "💍",
  "GOLD BRACELET": "⚪",
  "GOLD CHAINS": "🔗",
  "GOLD NECKLACE": "📿",
  "GOLD BANGLE": "⚪",
  "GOLD EARRINGS": "💎",
  "GOLD PENDANT": "🔸",
  "BANGLE": "⚪",
  "BRACELET": "⚪",
  "CHAIN": "🔗",
  "EARRING": "💎",
  "NECKLACE": "📿",
  "PENDANT": "🔸",
  "RING": "💍",
};

export default function Inventory() {
  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => apiService.fetchInventoryCategories(),
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item: any) => {
          const deadstockRisk = 
            item.riskScore > 70 ? 'high' as const :
            item.riskScore > 40 ? 'medium' as const :
            'low' as const;
          
          return (
            <InventoryCard
              key={item.category}
              category={item.category}
              icon={categoryIcons[item.category] || "💎"}
              stockCount={item.itemCount}
              sales30d={Math.round(item.stockValue / 30000)} // Estimate daily sales
              ageing={Math.round(item.avgDaysToSell)}
              deadstockRisk={deadstockRisk}
              reorderSuggestion={item.avgDaysToSell < 10}
              confidence={Math.round(100 - item.riskScore)}
              trend={item.trend}
            />
          );
        })}
      </div>
    </div>
  );
}
