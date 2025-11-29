import { useState, useMemo } from "react";
import { Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles, Search, TrendingUp as TrendingUpIcon, Check, RotateCcw, RefreshCw } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { KPICard } from "@/components/KPICard";
import { AISuggestionCard } from "@/components/AISuggestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryCard } from "@/components/InventoryCard";
import { CustomizableCard } from "@/components/CustomizableCard";
import { VisibilityTogglePanel, type CardVisibility } from "@/components/VisibilityTogglePanel";
import { ColorPicker } from "@/components/ColorPicker";
import { useDashboardCustomization } from "@/contexts/DashboardCustomizationContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STORAGE_KEY = "dashboard-customization";

// Individual KPI card definitions
const KPI_CARD_DEFINITIONS = [
  { id: "kpi-total-stock", title: "Total Stock Value", value: "₹48.5L", change: "+5.2% from last month", changeType: "positive" as const, icon: Package, iconBg: "bg-primary/10" },
  { id: "kpi-ageing-stock", title: "Ageing Stock", value: "₹12.3L", change: "23% of total inventory", changeType: "neutral" as const, icon: TrendingDown, iconBg: "bg-warning/10" },
  { id: "kpi-deadstock", title: "Predicted Deadstock", value: "₹4.8L", change: "-12% vs last period", changeType: "positive" as const, icon: AlertTriangle, iconBg: "bg-destructive/10" },
  { id: "kpi-fast-moving", title: "Fast Moving Items", value: "42", change: "8 items added this week", changeType: "positive" as const, icon: TrendingUp, iconBg: "bg-success/10" },
];

// Analytics module definitions
const ANALYTICS_MODULE_DEFINITIONS = [
  { id: "analytics-demand", label: "Demand Prediction" },
  { id: "analytics-ageing", label: "Stock Ageing Breakdown" },
  { id: "analytics-reorder", label: "Reorder Suggestions" },
  { id: "analytics-performance", label: "Category Performance" },
  { id: "analytics-margin", label: "Contribution Margin" },
  { id: "analytics-competition", label: "Competitive Pricing" },
];

// Default card order - now includes individual KPI cards and analytics modules
const DEFAULT_CARD_ORDER = [
  ...KPI_CARD_DEFINITIONS.map(k => k.id),
  "stock-distribution",
  "quick-actions",
  "ai-recommendations",
  // Analytics modules are hidden by default, so not in initial order
];

// Default visibility - individual KPI cards and analytics modules
const DEFAULT_CARD_VISIBILITY: CardVisibility[] = [
  ...KPI_CARD_DEFINITIONS.map(k => ({ id: k.id, label: k.title, visible: true })),
  { id: "stock-distribution", label: "Stock Distribution Chart", visible: true },
  { id: "quick-actions", label: "Quick Actions", visible: true },
  { id: "ai-recommendations", label: "AI Recommendations", visible: true },
  ...ANALYTICS_MODULE_DEFINITIONS.map(m => ({ id: m.id, label: m.label, visible: false })),
];

const DEFAULT_CHART_COLORS = {
  stockDistribution: "hsl(var(--primary))",
  marketTrendGold: "hsl(var(--chart-1))",
  marketTrendSilver: "hsl(var(--chart-2))",
  marketTrendDiamond: "hsl(var(--chart-3))",
  keywordSearch: "hsl(var(--primary))",
  analyticsDemand: "hsl(var(--primary))",
  analyticsPerformanceRevenue: "hsl(var(--primary))",
  analyticsPerformanceProfit: "hsl(var(--accent))",
};

interface DashboardCustomization {
  cardOrder: string[];
  cardVisibility: CardVisibility[];
  chartColors: typeof DEFAULT_CHART_COLORS;
}

const stockData = [
  { name: "Gold", value: 45 },
  { name: "Silver", value: 30 },
  { name: "Diamond", value: 15 },
  { name: "Platinum", value: 10 },
];

// Analytics data
const categoryData = [
  { name: "Gold", value: 45 },
  { name: "Silver", value: 30 },
  { name: "Diamond", value: 15 },
  { name: "Platinum", value: 10 },
];

const performanceData = [
  { month: "Jan", revenue: 450, profit: 120 },
  { month: "Feb", revenue: 520, profit: 145 },
  { month: "Mar", revenue: 480, profit: 132 },
  { month: "Apr", revenue: 610, profit: 178 },
  { month: "May", revenue: 550, profit: 156 },
  { month: "Jun", revenue: 670, profit: 198 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

// Simplified inventory data for popup
const topInventoryItems = [
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
];

// Market trends data for popup
const trendingCategories = [
  { name: "Lightweight Gold Chains", trend: "up", change: "+24%", color: "text-success" },
  { name: "Diamond Studs", trend: "up", change: "+18%", color: "text-success" },
  { name: "Temple Jewellery", trend: "up", change: "+15%", color: "text-success" },
  { name: "Silver Anklets", trend: "down", change: "-8%", color: "text-destructive" },
];

const marketTrendData = [
  { month: "Jan", gold: 45, silver: 30, diamond: 15 },
  { month: "Feb", gold: 52, silver: 28, diamond: 18 },
  { month: "Mar", gold: 48, silver: 32, diamond: 22 },
  { month: "Apr", gold: 61, silver: 35, diamond: 25 },
];

// Keywords data for popup
const keywordSampleData = [
  { month: "Jan", searches: 45 },
  { month: "Feb", searches: 52 },
  { month: "Mar", searches: 48 },
  { month: "Apr", searches: 61 },
];

const relatedSearches = [
  "gold chain designs",
  "22kt gold chain price",
  "lightweight gold chains for women",
  "gold chain with pendant",
];

function DashboardContent() {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const [keywordQuery, setKeywordQuery] = useState("gold chain");
  const [hasSearched, setHasSearched] = useState(false);
  const { isCustomizeMode, toggleCustomizeMode } = useDashboardCustomization();
  
  // Fetch real KPI data from API
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => apiService.fetchKPIs(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Fetch inventory categories for stock distribution chart
  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => apiService.fetchInventoryCategories(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  // Load customization from localStorage with migration support
  const loadCustomization = (): DashboardCustomization => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Migration: if old format with "kpi-cards" group, convert to individual cards
        let cardOrder = parsed.cardOrder || DEFAULT_CARD_ORDER;
        let cardVisibility = parsed.cardVisibility || DEFAULT_CARD_VISIBILITY;
        
        // Migrate from old "kpi-cards" to individual KPI cards
        if (cardOrder.includes("kpi-cards")) {
          const kpiIndex = cardOrder.indexOf("kpi-cards");
          cardOrder = [
            ...cardOrder.slice(0, kpiIndex),
            ...KPI_CARD_DEFINITIONS.map(k => k.id),
            ...cardOrder.slice(kpiIndex + 1),
          ];
        }
        
        // Ensure all KPI cards are in visibility if old format
        if (cardVisibility.find(c => c.id === "kpi-cards")) {
          cardVisibility = cardVisibility.filter(c => c.id !== "kpi-cards");
          cardVisibility = [
            ...cardVisibility,
            ...KPI_CARD_DEFINITIONS.map(k => ({ id: k.id, label: k.title, visible: true })),
          ];
        }
        
        // Ensure analytics modules are in visibility
        const existingAnalyticsIds = cardVisibility.map(c => c.id);
        ANALYTICS_MODULE_DEFINITIONS.forEach(module => {
          if (!existingAnalyticsIds.includes(module.id)) {
            cardVisibility.push({ id: module.id, label: module.label, visible: false });
          }
        });
        
        return {
          cardOrder,
          cardVisibility,
          chartColors: { ...DEFAULT_CHART_COLORS, ...(parsed.chartColors || {}) },
        };
      }
    } catch (error) {
      console.error("Failed to load customization:", error);
    }
    return {
      cardOrder: DEFAULT_CARD_ORDER,
      cardVisibility: DEFAULT_CARD_VISIBILITY,
      chartColors: DEFAULT_CHART_COLORS,
    };
  };

  const [customization, setCustomization] = useState<DashboardCustomization>(loadCustomization);

  // Save customization to localStorage
  const saveCustomization = (newCustomization: DashboardCustomization) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomization));
      setCustomization(newCustomization);
    } catch (error) {
      console.error("Failed to save customization:", error);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaults: DashboardCustomization = {
      cardOrder: DEFAULT_CARD_ORDER,
      cardVisibility: DEFAULT_CARD_VISIBILITY,
      chartColors: DEFAULT_CHART_COLORS,
    };
    saveCustomization(defaults);
  };

  // Toggle card visibility
  const toggleCardVisibility = (id: string) => {
    const updated = customization.cardVisibility.map((card) =>
      card.id === id ? { ...card, visible: !card.visible } : card
    );
    
    // If enabling an analytics module, add it to cardOrder if not present
    const card = updated.find(c => c.id === id);
    if (card?.visible && !customization.cardOrder.includes(id)) {
      const newOrder = [...customization.cardOrder, id];
      saveCustomization({ ...customization, cardOrder: newOrder, cardVisibility: updated });
    } else {
      saveCustomization({ ...customization, cardVisibility: updated });
    }
  };

  // Handle drag end
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = customization.cardOrder.indexOf(active.id);
      const newIndex = customization.cardOrder.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(customization.cardOrder, oldIndex, newIndex);
        saveCustomization({ ...customization, cardOrder: newOrder });
      }
    }
  };

  // Handle nested KPI card drag (within KPI section)
  const handleKPIDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      // Get only KPI card IDs
      const kpiCardIds = customization.cardOrder.filter(id => id.startsWith("kpi-"));
      const otherCardIds = customization.cardOrder.filter(id => !id.startsWith("kpi-"));
      
      const oldIndex = kpiCardIds.indexOf(active.id);
      const newIndex = kpiCardIds.indexOf(over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedKPIs = arrayMove(kpiCardIds, oldIndex, newIndex);
        // Find where KPI section starts in the full order
        const firstKpiIndex = customization.cardOrder.findIndex(id => id.startsWith("kpi-"));
        const newOrder = [
          ...customization.cardOrder.slice(0, firstKpiIndex),
          ...reorderedKPIs,
          ...otherCardIds.filter(id => !customization.cardOrder.slice(0, firstKpiIndex).includes(id)),
        ];
        saveCustomization({ ...customization, cardOrder: newOrder });
      }
    }
  };

  // Update chart color
  const updateChartColor = (chartId: keyof typeof DEFAULT_CHART_COLORS, color: string) => {
    saveCustomization({
      ...customization,
      chartColors: { ...customization.chartColors, [chartId]: color },
    });
  };

  // Get visible cards in order
  const visibleCardsInOrder = useMemo(() => {
    return customization.cardOrder.filter((id) => {
      const card = customization.cardVisibility.find((c) => c.id === id);
      return card?.visible;
    });
  }, [customization.cardOrder, customization.cardVisibility]);

  // Get visible KPI cards in order
  const visibleKPICards = useMemo(() => {
    const kpiIds = customization.cardOrder.filter(id => id.startsWith("kpi-"));
    return kpiIds.filter((id) => {
      const card = customization.cardVisibility.find((c) => c.id === id);
      return card?.visible;
    });
  }, [customization.cardOrder, customization.cardVisibility]);

  // Get non-KPI visible cards
  const visibleNonKPICards = useMemo(() => {
    return visibleCardsInOrder.filter(id => !id.startsWith("kpi-"));
  }, [visibleCardsInOrder]);

  const handleKeywordSearch = () => {
    setHasSearched(true);
  };

  // Render individual KPI card with real data
  const renderKPICard = (kpiId: string) => {
    const kpiDef = KPI_CARD_DEFINITIONS.find(k => k.id === kpiId);
    if (!kpiDef) return null;
    
    // Use real data from API if available, otherwise fallback to static data
    let value = kpiDef.value;
    let change = kpiDef.change;
    let changeType = kpiDef.changeType;
    
    if (kpis && !kpisLoading) {
      switch (kpiId) {
        case "kpi-total-stock":
          value = `₹${(kpis.totalStockValue / 100000).toFixed(1)}L`;
          change = `${kpis.totalItems} items in inventory`;
          changeType = "neutral" as const;
          break;
        case "kpi-ageing-stock":
          value = `${kpis.ageingStock}`;
          change = `${((kpis.ageingStock / kpis.totalItems) * 100).toFixed(1)}% of total inventory`;
          changeType = "neutral" as const;
          break;
        case "kpi-deadstock":
          value = `${kpis.predictedDeadstock}`;
          change = `${((kpis.predictedDeadstock / kpis.totalItems) * 100).toFixed(1)}% risk items`;
          changeType = kpis.predictedDeadstock > 20 ? "negative" as const : "positive" as const;
          break;
        case "kpi-fast-moving":
          value = `${kpis.fastMovingItems}`;
          change = `${((kpis.fastMovingItems / kpis.totalItems) * 100).toFixed(1)}% fast movers`;
          changeType = "positive" as const;
          break;
      }
    }
    
    return (
      <CustomizableCard
        key={kpiId}
        id={kpiId}
        isCustomizeMode={isCustomizeMode}
      >
        <KPICard
          title={kpiDef.title}
          value={kpisLoading ? "Loading..." : value}
          change={kpisLoading ? "Fetching data..." : change}
          changeType={changeType}
          icon={kpiDef.icon}
          iconBg={kpiDef.iconBg}
        />
      </CustomizableCard>
    );
  };

  // Render analytics module
  const renderAnalyticsModule = (moduleId: string) => {
    switch (moduleId) {
      case "analytics-demand":
        return (
          <Card key={moduleId}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Demand Prediction</CardTitle>
              {isCustomizeMode && (
                <ColorPicker
                  color={customization.chartColors.analyticsDemand}
                  onChange={(color) => updateChartColor("analyticsDemand", color)}
                  label="Chart Color"
                />
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
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
                    dataKey="revenue"
                    stroke={customization.chartColors.analyticsDemand}
                    strokeWidth={2}
                    name="Revenue (₹000s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "analytics-ageing":
        return (
          <Card key={moduleId}>
            <CardHeader>
              <CardTitle>Stock Ageing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "analytics-performance":
        return (
          <Card key={moduleId} className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Category Performance Comparison</CardTitle>
              {isCustomizeMode && (
                <div className="flex gap-2">
                  <ColorPicker
                    color={customization.chartColors.analyticsPerformanceRevenue}
                    onChange={(color) => updateChartColor("analyticsPerformanceRevenue", color)}
                    label="Revenue"
                  />
                  <ColorPicker
                    color={customization.chartColors.analyticsPerformanceProfit}
                    onChange={(color) => updateChartColor("analyticsPerformanceProfit", color)}
                    label="Profit"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
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
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill={customization.chartColors.analyticsPerformanceRevenue} 
                    name="Revenue (₹000s)" 
                    radius={[8, 8, 0, 0]} 
                  />
                  <Bar 
                    dataKey="profit" 
                    fill={customization.chartColors.analyticsPerformanceProfit} 
                    name="Profit (₹000s)" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "analytics-reorder":
        return (
          <Card key={moduleId}>
            <CardHeader>
              <CardTitle>Reorder Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reorder suggestions will be displayed here.
              </p>
            </CardContent>
          </Card>
        );

      case "analytics-margin":
        return (
          <Card key={moduleId}>
            <CardHeader>
              <CardTitle>Contribution Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contribution margin analysis will be displayed here.
              </p>
            </CardContent>
          </Card>
        );

      case "analytics-competition":
        return (
          <Card key={moduleId}>
            <CardHeader>
              <CardTitle>Competitive Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Competitive pricing analysis will be displayed here.
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Render card by ID
  const renderCard = (cardId: string) => {
    switch (cardId) {
      case "stock-distribution":
        return (
          <Card key={cardId}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Stock Distribution by Category</CardTitle>
              {isCustomizeMode && (
                <ColorPicker
                  color={customization.chartColors.stockDistribution}
                  onChange={(color) => updateChartColor("stockDistribution", color)}
                  label="Chart Color"
                />
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={customization.chartColors.stockDistribution} 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "quick-actions":
        return (
          <Card key={cardId}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
                <DialogTrigger asChild>
                  <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
                    <p className="font-semibold text-foreground mb-1">View Inventory</p>
                    <p className="text-xs text-muted-foreground">
                      Check stock levels and ageing
                    </p>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Inventory Overview</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Key inventory items with stock levels, sales velocity, and ageing metrics
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {topInventoryItems.map((item) => (
                        <InventoryCard key={item.category} {...item} />
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={marketOpen} onOpenChange={setMarketOpen}>
                <DialogTrigger asChild>
                  <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
                    <p className="font-semibold text-foreground mb-1">Market Trends</p>
                    <p className="text-xs text-muted-foreground">
                      See what's trending now
                    </p>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Market Trends</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Trending in Indian Jewellery Market</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {trendingCategories.map((category) => (
                            <div
                              key={category.name}
                              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {category.trend === "up" ? (
                                  <TrendingUpIcon className="h-4 w-4 text-success" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-destructive" />
                                )}
                                <span className="text-sm font-medium text-foreground">{category.name}</span>
                              </div>
                              <Badge variant={category.trend === "up" ? "default" : "destructive"}>
                                {category.change}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Category Interest Over Time</CardTitle>
                        {isCustomizeMode && (
                          <div className="flex gap-2">
                            <ColorPicker
                              color={customization.chartColors.marketTrendGold}
                              onChange={(color) => updateChartColor("marketTrendGold", color)}
                              label="Gold"
                            />
                            <ColorPicker
                              color={customization.chartColors.marketTrendSilver}
                              onChange={(color) => updateChartColor("marketTrendSilver", color)}
                              label="Silver"
                            />
                            <ColorPicker
                              color={customization.chartColors.marketTrendDiamond}
                              onChange={(color) => updateChartColor("marketTrendDiamond", color)}
                              label="Diamond"
                            />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={marketTrendData}>
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
                              dataKey="gold"
                              stroke={customization.chartColors.marketTrendGold}
                              strokeWidth={2}
                              name="Gold"
                            />
                            <Line
                              type="monotone"
                              dataKey="silver"
                              stroke={customization.chartColors.marketTrendSilver}
                              strokeWidth={2}
                              name="Silver"
                            />
                            <Line
                              type="monotone"
                              dataKey="diamond"
                              stroke={customization.chartColors.marketTrendDiamond}
                              strokeWidth={2}
                              name="Diamond"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={keywordsOpen} onOpenChange={setKeywordsOpen}>
                <DialogTrigger asChild>
                  <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
                    <p className="font-semibold text-foreground mb-1">Keyword Search</p>
                    <p className="text-xs text-muted-foreground">
                      Research market demand
                    </p>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Keyword Intelligence</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Enter keyword (e.g., gold chain, diamond earrings)..."
                              className="pl-9"
                              value={keywordQuery}
                              onChange={(e) => setKeywordQuery(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
                            />
                          </div>
                          <Button onClick={handleKeywordSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {hasSearched && (
                      <>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Interest Over Time: "{keywordQuery}"</CardTitle>
                            {isCustomizeMode && (
                              <ColorPicker
                                color={customization.chartColors.keywordSearch}
                                onChange={(color) => updateChartColor("keywordSearch", color)}
                                label="Chart Color"
                              />
                            )}
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={keywordSampleData}>
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
                                  stroke={customization.chartColors.keywordSearch}
                                  strokeWidth={3}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <CardTitle>Related Search Phrases</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {relatedSearches.map((search, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                  >
                                    <TrendingUpIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-foreground">{search}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <span>AI Recommendation</span>
                                <Badge>92% Confidence</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2 text-sm">
                                  High Demand Detected
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Search interest for "{keywordQuery}" has grown 34% in the last quarter. 
                                  This indicates strong market demand.
                                </p>
                              </div>
                              <div className="pt-2">
                                <p className="text-xs font-semibold text-foreground">
                                  Potential Impact: <span className="text-success">High</span>
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );

      case "ai-recommendations":
        return (
          <div key={cardId}>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              AI Recommendations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AISuggestionCard
                title="Restock Gold Chains"
                reason="Sales velocity is 3x higher than average. Current stock will deplete in 8 days based on trend analysis."
                confidence={92}
                impact="high"
                category="Gold"
              />
              <AISuggestionCard
                title="Review Diamond Earrings Pricing"
                reason="Low turnover rate detected. Competitor analysis shows 12% price gap. Consider promotional strategy."
                confidence={78}
                impact="medium"
                category="Diamond"
              />
              <AISuggestionCard
                title="Clear Silver Bangles Stock"
                reason="Ageing inventory with declining market interest. Recommend clearance sale to free up capital."
                confidence={85}
                impact="medium"
                category="Silver"
              />
            </div>
          </div>
        );

      default:
        // Check if it's an analytics module
        if (cardId.startsWith("analytics-")) {
          return renderAnalyticsModule(cardId);
        }
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Customize Mode Controls */}
      {isCustomizeMode && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customize Dashboard</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetToDefaults} size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
                <Button onClick={toggleCustomizeMode} size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Done
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VisibilityTogglePanel
              cards={customization.cardVisibility}
              onToggle={toggleCardVisibility}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Daily Suggestion - Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-10 shadow-lg border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* Decorative glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
              <span className="text-sm font-semibold text-white">AI Daily Insight</span>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Welcome back, Raj Store
          </h1>
          
          <div className="space-y-3 max-w-3xl">
            <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
              Your gold chain inventory is moving faster than expected. Consider restocking by next week.
            </p>
            <p className="text-base text-white/90 leading-relaxed">
              Based on current sales velocity and market trends, your gold chain stock will deplete in 8 days. 
              Diamond earrings are showing low movement—review pricing strategy to improve turnover.
            </p>
          </div>
        </div>
      </div>

      {/* Customizable Cards with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over) return;
          
          // If both are KPI cards, handle KPI reordering
          if (active.id.toString().startsWith("kpi-") && over.id.toString().startsWith("kpi-")) {
            handleKPIDragEnd(event);
          } else if (!active.id.toString().startsWith("kpi-") && !over.id.toString().startsWith("kpi-")) {
            // Both are non-KPI cards, handle normal reordering
            handleDragEnd(event);
          }
          // If mixing KPI and non-KPI, don't allow (ignore the drag)
        }}
      >
        <div className="space-y-6">
          {/* KPI Cards Section */}
          {visibleKPICards.length > 0 && (
            <SortableContext
              items={visibleKPICards}
              strategy={rectSortingStrategy}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {visibleKPICards.map((kpiId) => renderKPICard(kpiId))}
              </div>
            </SortableContext>
          )}

          {/* Other Cards */}
          <SortableContext
            items={visibleNonKPICards}
            strategy={rectSortingStrategy}
          >
            {visibleNonKPICards.map((cardId) => {
              const cardContent = renderCard(cardId);
              if (!cardContent) return null;

              // Wrap each card with CustomizableCard
              return (
                <CustomizableCard
                  key={cardId}
                  id={cardId}
                  isCustomizeMode={isCustomizeMode}
                >
                  {cardContent}
                </CustomizableCard>
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}

export default function Dashboard() {
  const { isCustomizeMode } = useDashboardCustomization();
  
  return <DashboardContent />;
}
