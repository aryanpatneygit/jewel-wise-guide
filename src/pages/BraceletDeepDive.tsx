import { useState, useMemo } from "react";
import { Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles, ArrowLeft, Filter, X, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KPICard } from "@/components/KPICard";
import { formatIndianCurrency } from "@/lib/utils";
import { generateBraceletReport } from "@/lib/reportGenerator";
import {
  braceletInventory,
  getBraceletsByLifecycleStage,
  getTotalStockValue,
  getAverageDaysInInventory,
  getStockValueByLifecycle,
  getStockDistributionByType,
  getStockDistributionByMetal,
  getStockDistributionByLocation,
  getStockDistributionByDesignStyle,
  type BraceletItem,
} from "@/data/braceletData";

export default function BraceletDeepDive() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("fast-moving");
  
  // Global filter state that applies to all tabs
  const [filters, setFilters] = useState<{ metal: string; location: string }>({
    metal: "all",
    location: "all",
  });

  // State for dialog modals
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({
    "bracelet-type": false,
    "metal-type": false,
    "design-style": false,
    "stock-location": false,
    "lifecycle-summary": false,
  });
  
  const setDialogOpen = (dialogId: string, open: boolean) => {
    setOpenDialogs((prev) => ({ ...prev, [dialogId]: open }));
  };

  // Calculate KPIs with useMemo to prevent recalculation on every render
  // Note: These use unfiltered data for overall KPIs
  const totalStockValue = useMemo(() => getTotalStockValue(), []);
  const deadStockItems = useMemo(() => getBraceletsByLifecycleStage("Dead Stock"), []);
  const deadStockValue = useMemo(() => 
    deadStockItems.reduce((sum, item) => sum + item.finalSellingPrice, 0), 
    [deadStockItems]
  );
  const fastMovingItems = useMemo(() => getBraceletsByLifecycleStage("Fast-moving"), []);
  const avgDaysToSell = useMemo(() => getAverageDaysInInventory(), []);

  // Apply global filters to all inventory first
  const filteredInventory = useMemo(() => {
    return braceletInventory.filter((item) => {
      const metalMatch = filters.metal === "all" || item.metal === filters.metal;
      const locationMatch = filters.location === "all" || item.stockLocation === filters.location;
      return metalMatch && locationMatch;
    });
  }, [filters]);

  // Stock classification data (from filtered inventory)
  const fastMovingStock = useMemo(() => 
    filteredInventory.filter((item) => item.lifecycleStage === "Fast-moving"), 
    [filteredInventory]
  );
  const slowMovingStock = useMemo(() => 
    filteredInventory.filter((item) => 
      item.lifecycleStage === "Slow-moving" || item.lifecycleStage === "Ageing Stock"
    ), 
    [filteredInventory]
  );
  const deadStock = useMemo(() => 
    filteredInventory.filter((item) => item.lifecycleStage === "Dead Stock"), 
    [filteredInventory]
  );

  // Get unique metals and locations for filter options
  const uniqueMetals = useMemo(() => {
    const metals = new Set<string>();
    braceletInventory.forEach((item) => metals.add(item.metal));
    return Array.from(metals).sort();
  }, []);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    braceletInventory.forEach((item) => locations.add(item.stockLocation));
    return Array.from(locations).sort();
  }, []);

  // Distribution data
  const distributionByType = useMemo(() => getStockDistributionByType(), []);
  const distributionByMetal = useMemo(() => getStockDistributionByMetal(), []);
  const distributionByDesignStyle = useMemo(() => getStockDistributionByDesignStyle(), []);
  const distributionByLocation = useMemo(() => getStockDistributionByLocation(), []);

  // AI Insights calculation
  const deadStockPercentage = useMemo(() => 
    ((deadStockItems.length / braceletInventory.length) * 100).toFixed(1),
    [deadStockItems]
  );
  const fastMovingPercentage = useMemo(() =>
    ((fastMovingItems.length / braceletInventory.length) * 100).toFixed(1),
    [fastMovingItems]
  );
  // Calculate avgSalesVelocity from filtered fast moving stock for tab summaries
  const avgSalesVelocity = useMemo(() =>
    fastMovingStock.length > 0
      ? (fastMovingStock.reduce((sum, item) => sum + item.salesVelocity, 0) / fastMovingStock.length).toFixed(1)
      : "0",
    [fastMovingStock]
  );

  // Get top performing and worst performing types
  const typePerformance = useMemo(() => 
    distributionByType.map((type) => {
      const items = braceletInventory.filter((item) => item.type === type.type);
      const avgVelocity = items.length > 0 
        ? items.reduce((sum, item) => sum + item.salesVelocity, 0) / items.length
        : 0;
      return { ...type, avgVelocity };
    }),
    [distributionByType]
  );
  
  const topPerforming = useMemo(() =>
    typePerformance.length > 0 
      ? [...typePerformance].sort((a, b) => b.avgVelocity - a.avgVelocity)[0]
      : { type: "N/A", count: 0, value: 0, avgVelocity: 0 },
    [typePerformance]
  );
  
  const worstPerforming = useMemo(() =>
    typePerformance.length > 0
      ? [...typePerformance].sort((a, b) => a.avgVelocity - b.avgVelocity)[0]
      : { type: "N/A", count: 0, value: 0, avgVelocity: 0 },
    [typePerformance]
  );

  // Design style performance analysis
  const designStylePerformance = useMemo(() => 
    distributionByDesignStyle.map((style) => {
      const items = braceletInventory.filter((item) => item.designStyle === style.style);
      const avgVelocity = items.length > 0 
        ? items.reduce((sum, item) => sum + item.salesVelocity, 0) / items.length
        : 0;
      return { ...style, avgVelocity };
    }),
    [distributionByDesignStyle]
  );
  
  const topPerformingDesign = useMemo(() =>
    designStylePerformance.length > 0 
      ? [...designStylePerformance].sort((a, b) => b.avgVelocity - a.avgVelocity)[0]
      : { style: "N/A", count: 0, value: 0, avgVelocity: 0 },
    [designStylePerformance]
  );
  
  const worstPerformingDesign = useMemo(() =>
    designStylePerformance.length > 0
      ? [...designStylePerformance].sort((a, b) => a.avgVelocity - b.avgVelocity)[0]
      : { style: "N/A", count: 0, value: 0, avgVelocity: 0 },
    [designStylePerformance]
  );

  // Calculate metrics for AI summaries
  const fastMovingValue = useMemo(() => 
    fastMovingStock.reduce((sum, item) => sum + item.finalSellingPrice, 0),
    [fastMovingStock]
  );
  const fastMovingAvgPrice = useMemo(() =>
    fastMovingStock.length > 0 ? fastMovingValue / fastMovingStock.length : 0,
    [fastMovingStock, fastMovingValue]
  );
  const fastMovingTopType = useMemo(() => {
    const typeCounts = new Map<string, number>();
    fastMovingStock.forEach(item => {
      typeCounts.set(item.type, (typeCounts.get(item.type) || 0) + 1);
    });
    return Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [fastMovingStock]);

  const fastMovingTopDesign = useMemo(() => {
    const designCounts = new Map<string, number>();
    fastMovingStock.forEach(item => {
      designCounts.set(item.designStyle, (designCounts.get(item.designStyle) || 0) + 1);
    });
    return Array.from(designCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [fastMovingStock]);

  const slowMovingValue = useMemo(() => 
    slowMovingStock.reduce((sum, item) => sum + item.finalSellingPrice, 0),
    [slowMovingStock]
  );
  const slowMovingAvgDays = useMemo(() =>
    slowMovingStock.length > 0
      ? Math.round(slowMovingStock.reduce((sum, item) => sum + item.daysInInventory, 0) / slowMovingStock.length)
      : 0,
    [slowMovingStock]
  );
  const slowMovingAvgPrice = useMemo(() =>
    slowMovingStock.length > 0 ? slowMovingValue / slowMovingStock.length : 0,
    [slowMovingStock, slowMovingValue]
  );

  const slowMovingTopDesign = useMemo(() => {
    const designCounts = new Map<string, number>();
    slowMovingStock.forEach(item => {
      designCounts.set(item.designStyle, (designCounts.get(item.designStyle) || 0) + 1);
    });
    return Array.from(designCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [slowMovingStock]);

  const deadStockValueFiltered = useMemo(() => 
    deadStock.reduce((sum, item) => sum + item.finalSellingPrice, 0),
    [deadStock]
  );
  const deadStockAvgDays = useMemo(() =>
    deadStock.length > 0
      ? Math.round(deadStock.reduce((sum, item) => sum + item.daysInInventory, 0) / deadStock.length)
      : 0,
    [deadStock]
  );
  const deadStockAvgPrice = useMemo(() =>
    deadStock.length > 0 ? deadStockValueFiltered / deadStock.length : 0,
    [deadStock, deadStockValueFiltered]
  );

  const deadStockTopDesign = useMemo(() => {
    const designCounts = new Map<string, number>();
    deadStock.forEach(item => {
      designCounts.set(item.designStyle, (designCounts.get(item.designStyle) || 0) + 1);
    });
    return Array.from(designCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [deadStock]);

  // Early safety check after hooks
  if (!braceletInventory || braceletInventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">Bracelet inventory data could not be loaded.</p>
          <Button onClick={() => navigate("/inventory")} className="mt-4">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  // Render filter section
  const renderFilters = () => {
    const hasActiveFilters = filters.metal !== "all" || filters.location !== "all";
    
    return (
      <div className="mb-6 p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="filter-metal" className="text-sm text-muted-foreground">
              Metal:
            </label>
            <Select
              value={filters.metal}
              onValueChange={(value) => setFilters({ ...filters, metal: value })}
            >
              <SelectTrigger id="filter-metal" className="w-[180px]">
                <SelectValue placeholder="All Metals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metals</SelectItem>
                {uniqueMetals.map((metal) => (
                  <SelectItem key={metal} value={metal}>
                    {metal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-location" className="text-sm text-muted-foreground">
              Location:
            </label>
            <Select
              value={filters.location}
              onValueChange={(value) => setFilters({ ...filters, location: value })}
            >
              <SelectTrigger id="filter-location" className="w-[180px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ metal: "all", location: "all" })}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render inventory table
  const renderInventoryTable = (items: BraceletItem[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Metal</TableHead>
            <TableHead>Design Style</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Days in Stock</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.sku}>
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.metal} ({item.metalPurity})</TableCell>
                <TableCell>{item.designStyle}</TableCell>
                <TableCell>{formatIndianCurrency(item.finalSellingPrice)}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.daysInInventory > 180 ? "destructive" : item.daysInInventory > 90 ? "secondary" : "default"}
                  >
                    {item.daysInInventory} days
                  </Badge>
                </TableCell>
                <TableCell>{item.stockLocation}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.lifecycleStage === "Fast-moving"
                        ? "default"
                        : item.lifecycleStage === "Dead Stock"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {item.lifecycleStage}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No items match the selected filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/inventory")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bracelet Inventory Deep Dive</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analysis of bracelet stock movement and performance
            </p>
          </div>
        </div>
        <Button
          onClick={async () => {
            try {
              await generateBraceletReport({
                totalStockValue,
                totalItems: braceletInventory.length,
                deadStockItems,
                deadStockValue,
                deadStockPercentage,
                fastMovingItems,
                fastMovingValue,
                fastMovingPercentage,
                slowMovingItems: slowMovingStock,
                slowMovingValue,
                avgDaysToSell,
                topPerforming,
                worstPerforming,
                fastMovingTopType,
                avgSalesVelocity,
                fastMovingAvgPrice,
                slowMovingAvgDays,
                slowMovingAvgPrice,
                deadStockAvgDays,
                deadStockAvgPrice,
                distributionByType,
                distributionByMetal,
                distributionByDesignStyle,
                distributionByLocation,
                topPerformingDesign,
                worstPerformingDesign,
                fastMovingTopDesign,
                slowMovingTopDesign,
                deadStockTopDesign,
              });
            } catch (error) {
              console.error("Error generating report:", error);
              alert("Failed to generate report. Please try again.");
            }
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* AI Insights Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card p-8 md:p-10 shadow-lg border-2 border-primary/30">
        {/* Decorative blue accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border-2 border-primary">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">AI Insights</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Bracelet Inventory Health Report</h2>

          <div className="space-y-2">
            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground mb-2">📊 Overall Performance</p>
              <p className="text-foreground/90 leading-relaxed">
                Your bracelet inventory consists of {braceletInventory.length} items valued at{" "}
                {formatIndianCurrency(totalStockValue)}. Fast-moving items account for {fastMovingPercentage}% of
                inventory with an average sales velocity of {avgSalesVelocity} units/month.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground mb-2">⚠️ Dead Stock Alert</p>
              <p className="text-foreground/90 leading-relaxed">
                {deadStockItems.length} items ({deadStockPercentage}%) are classified as dead stock, representing{" "}
                {formatIndianCurrency(deadStockValue)} in tied-up capital. Consider promotional pricing or bundling
                strategies to clear these items.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground mb-2">🏆 Top Performer</p>
              <p className="text-foreground/90 leading-relaxed">
                {topPerforming.type} bracelets are your star performers with {topPerforming.count} items generating
                strong sales. {worstPerforming.type} bracelets need strategic intervention with only{" "}
                {worstPerforming.count} items showing minimal movement. In terms of design styles, {topPerformingDesign.style} jewelry 
                is selling significantly better (avg velocity: {topPerformingDesign.avgVelocity.toFixed(1)} units/month) compared to {worstPerformingDesign.style} designs 
                (avg velocity: {worstPerformingDesign.avgVelocity.toFixed(1)} units/month).
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground mb-2">💡 Recommendations</p>
              <ul className="text-foreground/90 leading-relaxed space-y-1 list-disc list-inside">
                <li>Restock {topPerforming.type} bracelets with {topPerformingDesign.style} designs - high demand detected</li>
                <li>Implement clearance sale for items with 180+ days in inventory, especially {worstPerformingDesign.style} designs</li>
                <li>Review pricing strategy for {worstPerforming.type} category</li>
                <li>Consider seasonal promotions to boost slow-moving inventory</li>
                <li>Focus on {topPerformingDesign.style} jewelry styles for new purchases as they're outperforming other designs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Bracelet Stock Value"
          value={formatIndianCurrency(totalStockValue)}
          change={`${braceletInventory.length} items in inventory`}
          changeType="neutral"
          icon={Package}
          iconBg="bg-primary/10"
        />
        <KPICard
          title="Dead Stock Value"
          value={formatIndianCurrency(deadStockValue)}
          change={`${deadStockItems.length} items (${deadStockPercentage}% of total)`}
          changeType="negative"
          icon={AlertTriangle}
          iconBg="bg-destructive/10"
        />
        <KPICard
          title="Fast Moving Items"
          value={`${fastMovingItems.length}`}
          change={`${fastMovingPercentage}% of inventory`}
          changeType="positive"
          icon={TrendingUp}
          iconBg="bg-success/10"
        />
        <KPICard
          title="Avg. Days in Inventory"
          value={`${avgDaysToSell} days`}
          change="Across all bracelet items"
          changeType="neutral"
          icon={TrendingDown}
          iconBg="bg-warning/10"
        />
      </div>

      {/* Stock Classification Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Stock Movement Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global Filters */}
          {renderFilters()}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fast-moving" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Fast Moving ({fastMovingStock.length})
              </TabsTrigger>
              <TabsTrigger value="slow-moving" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Slow Moving ({slowMovingStock.length})
              </TabsTrigger>
              <TabsTrigger value="dead-stock" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Dead Stock ({deadStock.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fast-moving" className="mt-6">
              {/* AI Summary Section */}
              <div className="mb-6 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-success" />
                  <h3 className="text-lg font-bold text-foreground">AI Summary & Recommendations</h3>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-success/20">
                  <p className="text-foreground/90 leading-relaxed mb-3">
                    Your {fastMovingStock.length} fast-moving bracelets (valued at {formatIndianCurrency(fastMovingValue)}) are selling at 
                    {avgSalesVelocity} units/month, indicating strong market demand. {fastMovingTopType} bracelets are your top performers. 
                    In terms of design styles, {fastMovingTopDesign} jewelry is dominating this category, showing customers prefer this aesthetic.
                  </p>
                  <p className="text-foreground/90 leading-relaxed mb-2">
                    <strong className="text-foreground">Key Actions:</strong>
                  </p>
                  <ul className="text-foreground/90 leading-relaxed space-y-1.5 list-disc list-inside ml-2 text-sm">
                    <li>Maintain 2-3 months of inventory and set reorder points at 30-40% stock levels</li>
                    <li>Prioritize restocking {fastMovingTopDesign} design styles as they're driving the most sales</li>
                    <li>Consider 5-10% price increases to improve margins without impacting demand</li>
                    <li>Bundle with slower-moving items to create value packages</li>
                    <li>Feature prominently in marketing and place in high-traffic retail locations</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Fast Moving Bracelets</h3>
                <p className="text-sm text-muted-foreground">
                  Items with high sales velocity (2+ units/month) showing strong market demand
                </p>
              </div>

              {renderInventoryTable(fastMovingStock)}
            </TabsContent>

            <TabsContent value="slow-moving" className="mt-6">
              {/* AI Summary Section */}
              <div className="mb-6 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-warning" />
                  <h3 className="text-lg font-bold text-foreground">AI Summary & Recommendations</h3>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-warning/20">
                  <p className="text-foreground/90 leading-relaxed mb-3">
                    Your {slowMovingStock.length} slow-moving bracelets (valued at {formatIndianCurrency(slowMovingValue)}) have been in 
                    inventory for an average of {slowMovingAvgDays} days. Strategic intervention is needed to prevent them from becoming dead stock. 
                    {slowMovingTopDesign} design style appears most frequently in this category, suggesting lower customer interest in this aesthetic.
                  </p>
                  <p className="text-foreground/90 leading-relaxed mb-2">
                    <strong className="text-foreground">Key Actions:</strong>
                  </p>
                  <ul className="text-foreground/90 leading-relaxed space-y-1.5 list-disc list-inside ml-2 text-sm">
                    <li>Implement 15-25% discounts for items approaching 90 days and create "Featured Deals" sections</li>
                    <li>Bundle with fast-moving items (e.g., "Buy fast-moving, get 30% off slow-moving")</li>
                    <li>Avoid purchasing more {slowMovingTopDesign} designs until current stock clears</li>
                    <li>Relocate to high-traffic areas and create eye-catching displays with signage</li>
                    <li>Launch targeted social media campaigns and seasonal promotions</li>
                    <li>Train staff to proactively suggest these items based on customer preferences</li>
                    <li>If unsold after 120 days, consider transferring to different locations or channels</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Slow Moving Bracelets</h3>
                <p className="text-sm text-muted-foreground">
                  Items with moderate to low sales velocity requiring attention
                </p>
              </div>

              {renderInventoryTable(slowMovingStock)}
            </TabsContent>

            <TabsContent value="dead-stock" className="mt-6">
              {/* AI Summary Section */}
              <div className="mb-6 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-bold text-foreground">AI Summary & Recommendations</h3>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-destructive/20">
                  <p className="text-foreground/90 leading-relaxed mb-3">
                    Your {deadStock.length} dead stock items (valued at {formatIndianCurrency(deadStockValueFiltered)}) have been in inventory for 
                    an average of {deadStockAvgDays} days with zero sales. {deadStock.length > 0 && filteredInventory.length > 0 ? 
                    `This represents ${((deadStock.length / filteredInventory.length) * 100).toFixed(1)}% of filtered inventory` : 
                    'This represents significant tied-up capital'}. Immediate clearance action is critical. Notably, {deadStockTopDesign} design style 
                    dominates dead stock, indicating this aesthetic is not resonating with customers—avoid future purchases in this style.
                  </p>
                  <p className="text-foreground/90 leading-relaxed mb-2">
                    <strong className="text-foreground">Key Actions:</strong>
                  </p>
                  <ul className="text-foreground/90 leading-relaxed space-y-1.5 list-disc list-inside ml-2 text-sm">
                    <li>Launch "Final Clearance" event with 30-50% discounts - better to recover 50-70% quickly than hold indefinitely</li>
                    <li>Offer bulk promotions ("Buy 2, Get 1 Free") to move multiple units per transaction</li>
                    <li>Consider liquidation channels: outlet stores, online marketplaces, auction sites, or wholesale</li>
                    <li>Bundle as "free gifts" with fast-moving product purchases</li>
                    <li>Completely stop purchasing {deadStockTopDesign} jewelry until existing stock is cleared</li>
                    <li>For precious metals, evaluate scrap value - may exceed discounted sales value</li>
                    <li>Set 60-90 day clearance deadline, then move to liquidation or material recovery</li>
                    <li>Analyze design patterns in dead stock to prevent future accumulation of unpopular styles</li>
                  </ul>
                  <div className="mt-3 p-3 rounded bg-destructive/20 border border-destructive/30">
                    <p className="text-sm font-semibold text-destructive mb-1">⚠️ Financial Impact:</p>
                    <p className="text-sm text-foreground/90">
                      Freeing up {formatIndianCurrency(deadStockValueFiltered)} could be reinvested in {fastMovingAvgPrice > 0 ? 
                      Math.round(deadStockValueFiltered / fastMovingAvgPrice) : 0} 
                      {" "}fast-moving bracelets (especially {fastMovingTopDesign} styles) generating regular sales.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Dead Stock Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      These items have not sold in over 90 days and represent {formatIndianCurrency(deadStockValueFiltered)} in
                      tied capital. Immediate action recommended.
                    </p>
                  </div>
                </div>
              </div>

              {renderInventoryTable(deadStock)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Distribution Summary - Popup Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* By Bracelet Type */}
        <>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDialogOpen("bracelet-type", true)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Distribution by Bracelet Type</CardTitle>
            </CardHeader>
          </Card>
          <Dialog open={openDialogs["bracelet-type"]} onOpenChange={(open) => setDialogOpen("bracelet-type", open)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Distribution by Bracelet Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {distributionByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">{item.type}</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatIndianCurrency(item.value)}</p>
                      <p className="text-xs text-muted-foreground">{item.count} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>

        {/* By Metal Type */}
        <>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDialogOpen("metal-type", true)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Distribution by Metal Type</CardTitle>
            </CardHeader>
          </Card>
          <Dialog open={openDialogs["metal-type"]} onOpenChange={(open) => setDialogOpen("metal-type", open)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Distribution by Metal Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {distributionByMetal.map((item) => (
                  <div key={item.metal} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">{item.metal}</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatIndianCurrency(item.value)}</p>
                      <p className="text-xs text-muted-foreground">{item.count} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>

        {/* By Design Style */}
        <>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDialogOpen("design-style", true)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Distribution by Design Style</CardTitle>
            </CardHeader>
          </Card>
          <Dialog open={openDialogs["design-style"]} onOpenChange={(open) => setDialogOpen("design-style", open)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Distribution by Design Style</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {distributionByDesignStyle.map((item) => (
                  <div key={item.style} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">{item.style}</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatIndianCurrency(item.value)}</p>
                      <p className="text-xs text-muted-foreground">{item.count} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>

        {/* By Stock Location */}
        <>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDialogOpen("stock-location", true)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Distribution by Stock Location</CardTitle>
            </CardHeader>
          </Card>
          <Dialog open={openDialogs["stock-location"]} onOpenChange={(open) => setDialogOpen("stock-location", open)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Distribution by Stock Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {distributionByLocation.map((item) => (
                  <div key={item.location} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">{item.location}</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatIndianCurrency(item.value)}</p>
                      <p className="text-xs text-muted-foreground">{item.count} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>

        {/* Stock Lifecycle Summary */}
        <>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDialogOpen("lifecycle-summary", true)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stock Lifecycle Summary</CardTitle>
            </CardHeader>
          </Card>
          <Dialog open={openDialogs["lifecycle-summary"]} onOpenChange={(open) => setDialogOpen("lifecycle-summary", open)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Stock Lifecycle Summary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {getStockValueByLifecycle().map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          stage.stage === "Fast-moving"
                            ? "default"
                            : stage.stage === "Dead Stock"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {stage.stage}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{stage.count} items</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatIndianCurrency(stage.value)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((stage.value / totalStockValue) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      </div>
    </div>
  );
}
