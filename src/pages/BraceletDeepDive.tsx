import { useState, useMemo } from "react";
import { Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles, ArrowLeft, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import { formatIndianCurrency } from "@/lib/utils";
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

  // Calculate KPIs with useMemo to prevent recalculation on every render
  const totalStockValue = useMemo(() => getTotalStockValue(), []);
  const deadStockItems = useMemo(() => getBraceletsByLifecycleStage("Dead Stock"), []);
  const deadStockValue = useMemo(() => 
    deadStockItems.reduce((sum, item) => sum + item.finalSellingPrice, 0), 
    [deadStockItems]
  );
  const fastMovingItems = useMemo(() => getBraceletsByLifecycleStage("Fast-moving"), []);
  const avgDaysToSell = useMemo(() => getAverageDaysInInventory(), []);

  // Stock classification data
  const fastMovingStock = useMemo(() => getBraceletsByLifecycleStage("Fast-moving"), []);
  const slowMovingStock = useMemo(() => [
    ...getBraceletsByLifecycleStage("Slow-moving"),
    ...getBraceletsByLifecycleStage("Ageing Stock"),
  ], []);
  const deadStock = useMemo(() => getBraceletsByLifecycleStage("Dead Stock"), []);

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
  const avgSalesVelocity = useMemo(() =>
    fastMovingItems.length > 0
      ? (fastMovingItems.reduce((sum, item) => sum + item.salesVelocity, 0) / fastMovingItems.length).toFixed(1)
      : "0",
    [fastMovingItems]
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

  const deadStockAvgDays = useMemo(() =>
    deadStock.length > 0
      ? Math.round(deadStock.reduce((sum, item) => sum + item.daysInInventory, 0) / deadStock.length)
      : 0,
    [deadStock]
  );
  const deadStockAvgPrice = useMemo(() =>
    deadStock.length > 0 ? deadStockValue / deadStock.length : 0,
    [deadStock, deadStockValue]
  );

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
                No items in this category
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

          <div className="space-y-3 max-w-4xl mx-auto">
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
                {worstPerforming.count} items showing minimal movement.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground mb-2">💡 Recommendations</p>
              <ul className="text-foreground/90 leading-relaxed space-y-1 list-disc list-inside">
                <li>Restock {topPerforming.type} bracelets - high demand detected</li>
                <li>Implement clearance sale for items with 180+ days in inventory</li>
                <li>Review pricing strategy for {worstPerforming.type} category</li>
                <li>Consider seasonal promotions to boost slow-moving inventory</li>
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
                  </p>
                  <p className="text-foreground/90 leading-relaxed mb-2">
                    <strong className="text-foreground">Key Actions:</strong>
                  </p>
                  <ul className="text-foreground/90 leading-relaxed space-y-1.5 list-disc list-inside ml-2 text-sm">
                    <li>Maintain 2-3 months of inventory and set reorder points at 30-40% stock levels</li>
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
                  </p>
                  <p className="text-foreground/90 leading-relaxed mb-2">
                    <strong className="text-foreground">Key Actions:</strong>
                  </p>
                  <ul className="text-foreground/90 leading-relaxed space-y-1.5 list-disc list-inside ml-2 text-sm">
                    <li>Implement 15-25% discounts for items approaching 90 days and create "Featured Deals" sections</li>
                    <li>Bundle with fast-moving items (e.g., "Buy fast-moving, get 30% off slow-moving")</li>
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
                    Your {deadStock.length} dead stock items (valued at {formatIndianCurrency(deadStockValue)}) have been in inventory for 
                    an average of {deadStockAvgDays} days with zero sales. This represents {deadStockPercentage}% of total inventory and 
                    significant tied-up capital. Immediate clearance action is critical.
                  </p>
                  <p className="text-foreground/90 leading-relaxed mb-2">
                    <strong className="text-foreground">Key Actions:</strong>
                  </p>
                  <ul className="text-foreground/90 leading-relaxed space-y-1.5 list-disc list-inside ml-2 text-sm">
                    <li>Launch "Final Clearance" event with 30-50% discounts - better to recover 50-70% quickly than hold indefinitely</li>
                    <li>Offer bulk promotions ("Buy 2, Get 1 Free") to move multiple units per transaction</li>
                    <li>Consider liquidation channels: outlet stores, online marketplaces, auction sites, or wholesale</li>
                    <li>Bundle as "free gifts" with fast-moving product purchases</li>
                    <li>For precious metals, evaluate scrap value - may exceed discounted sales value</li>
                    <li>Set 60-90 day clearance deadline, then move to liquidation or material recovery</li>
                    <li>Analyze patterns to prevent future dead stock accumulation</li>
                  </ul>
                  <div className="mt-3 p-3 rounded bg-destructive/20 border border-destructive/30">
                    <p className="text-sm font-semibold text-destructive mb-1">⚠️ Financial Impact:</p>
                    <p className="text-sm text-foreground/90">
                      Freeing up {formatIndianCurrency(deadStockValue)} could be reinvested in {Math.round(deadStockValue / fastMovingAvgPrice)} 
                      {" "}fast-moving bracelets generating regular sales.
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
                      These items have not sold in over 90 days and represent {formatIndianCurrency(deadStockValue)} in
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

      {/* Distribution Summary - Text-based */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Bracelet Type */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution by Bracelet Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          </CardContent>
        </Card>

        {/* By Metal Type */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution by Metal Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          </CardContent>
        </Card>

        {/* By Design Style */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution by Design Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          </CardContent>
        </Card>

        {/* By Stock Location */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution by Stock Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Stage Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Lifecycle Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
