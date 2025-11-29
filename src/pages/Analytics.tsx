import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
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
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

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

  const toggleModule = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

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
              <CardTitle>Demand Prediction</CardTitle>
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
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Revenue (₹000s)"
                  />
                </LineChart>
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
