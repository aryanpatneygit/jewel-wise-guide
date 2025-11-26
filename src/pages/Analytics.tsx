import { useState } from "react";
import { Plus, GripVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import { apiService } from "@/services/apiService";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))", "hsl(var(--accent))"];

const availableModules = [
  { id: "demand", label: "Demand Prediction", enabled: true },
  { id: "ageing", label: "Stock Ageing Breakdown", enabled: true },
  { id: "reorder", label: "Reorder Suggestions", enabled: false },
  { id: "performance", label: "Category Performance", enabled: true },
  { id: "margin", label: "Contribution Margin", enabled: false },
  { id: "competition", label: "Competitive Pricing", enabled: false },
];

export default function Analytics() {
  const [modules, setModules] = useState(availableModules);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiService.fetchAnalyticsPerformance(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: inventory, isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: () => apiService.fetchInventoryCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: predictions } = useQuery({
    queryKey: ['prediction-comparison'],
    queryFn: () => apiService.fetchPredictionComparison(100),
    staleTime: 5 * 60 * 1000,
  });

  const toggleModule = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const isLoading = analyticsLoading || inventoryLoading;
  const error = analyticsError || inventoryError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Error loading analytics: {error.message}</p>
        </div>
      </div>
    );
  }

  // Prepare data from real analytics
  const categoryData = inventory?.map((cat: any) => ({
    name: cat.category,
    value: cat.itemCount,
    stockValue: cat.stockValue,
  })) || [];

  const performanceData = inventory?.map((cat: any, idx: number) => ({
    category: cat.category.substring(0, 10),
    revenue: Math.round(cat.stockValue / 100000),
    turnover: Math.round(cat.avgDaysToSell),
    risk: Math.round(cat.riskScore),
  })) || [];

  // Use real prediction comparison data
  const predictionSample = predictions?.map((pred) => ({
    actual: Math.round(pred.actual),
    predicted: Math.round(pred.predicted),
    category: pred.category,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Custom Analytics Builder</h1>
          <p className="text-muted-foreground mt-1">
            Select and arrange insights that matter most to your business
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Save Layout
        </Button>
      </div>

      {/* Model Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">R² Score</p>
              <p className="text-2xl font-bold text-foreground">
                {(analytics?.model_performance?.r2_score * 100).toFixed(2)}%
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">RMSE</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{analytics?.model_performance?.rmse?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">MAE</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{analytics?.model_performance?.mae?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">MAPE</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics?.model_performance?.mape?.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Available Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={module.enabled}
                  onCheckedChange={() => toggleModule(module.id)}
                />
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{module.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Modules Display */}
      <div className="grid gap-6 md:grid-cols-2">
        {modules.find(m => m.id === "demand" && m.enabled) && (
          <Card>
            <CardHeader>
              <CardTitle>Actual vs Predicted Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart data={predictionSample}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="actual" 
                    stroke="hsl(var(--muted-foreground))" 
                    name="Actual Sales"
                  />
                  <YAxis 
                    dataKey="predicted" 
                    stroke="hsl(var(--muted-foreground))" 
                    name="Predicted Sales"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                  />
                  <Scatter
                    name="Predictions"
                    fill="hsl(var(--primary))"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {modules.find(m => m.id === "ageing" && m.enabled) && (
          <Card>
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
        )}

        {modules.find(m => m.id === "performance" && m.enabled) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Category Performance Comparison</CardTitle>
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
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₹000s)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" fill="hsl(var(--accent))" name="Profit (₹000s)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {!modules.some(m => m.enabled) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              No modules selected. Enable modules above to build your custom analytics view.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
