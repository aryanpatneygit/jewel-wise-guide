import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiService, type PredictionRequest } from "@/services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Package, Calendar, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  'BANGLE',
  'BRACELET',
  'CHAIN',
  'EARRING',
  'NECKLACE',
  'PENDANT',
  'RING'
];

interface PredictionHistory {
  id: string;
  timestamp: Date;
  request: PredictionRequest;
  result: number;
}

export default function Predictions() {
  const [formData, setFormData] = useState<PredictionRequest>({
    category: 'RING',
    net_weight: 5.0,
    voucher_date: new Date().toISOString().split('T')[0],
    purity: 22.0,
    store_id: 'MAIN_STORE',
  });

  const [history, setHistory] = useState<PredictionHistory[]>([]);

  const mutation = useMutation({
    mutationFn: (data: PredictionRequest) => apiService.predictSales(data),
    onSuccess: (data) => {
      // Add to history
      const newEntry: PredictionHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        request: formData,
        result: data.predicted_sales,
      };
      setHistory([newEntry, ...history.slice(0, 9)]); // Keep last 10
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({
      category: 'RING',
      net_weight: 5.0,
      voucher_date: new Date().toISOString().split('T')[0],
      purity: 22.0,
      store_id: 'MAIN_STORE',
    });
    mutation.reset();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Sales Value Predictor
        </h1>
        <p className="text-muted-foreground">
          Predict the sales value of jewelry items using our AI ensemble model (99.62% R² accuracy)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Prediction Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Item Details
            </CardTitle>
            <CardDescription>
              Enter the jewelry item specifications to get a predicted sales value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Net Weight (grams)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="100"
                    value={formData.net_weight}
                    onChange={(e) =>
                      setFormData({ ...formData, net_weight: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="5.0"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Voucher Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.voucher_date}
                    onChange={(e) =>
                      setFormData({ ...formData, voucher_date: e.target.value })
                    }
                  />
                </div>

                {/* Purity */}
                <div className="space-y-2">
                  <Label htmlFor="purity">Purity (Karats)</Label>
                  <Select
                    value={formData.purity?.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, purity: parseFloat(value) })
                    }
                  >
                    <SelectTrigger id="purity">
                      <SelectValue placeholder="Select purity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18">18K</SelectItem>
                      <SelectItem value="22">22K</SelectItem>
                      <SelectItem value="24">24K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Store ID */}
              <div className="space-y-2">
                <Label htmlFor="store">Store ID</Label>
                <Input
                  id="store"
                  type="text"
                  value={formData.store_id}
                  onChange={(e) =>
                    setFormData({ ...formData, store_id: e.target.value })
                  }
                  placeholder="MAIN_STORE"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Predict Sales Value
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={mutation.isPending}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Success Result */}
          {mutation.isSuccess && mutation.data && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Prediction Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Predicted Sales Value</p>
                  <p className="text-3xl font-bold text-green-700">
                    ₹{mutation.data.predicted_sales.toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{mutation.data.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{mutation.data.weight_grams}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Confidence:</span>
                    <span className="font-medium">
                      {(Math.max(...mutation.data.confidence) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    Prediction based on ensemble model with 99.62% R² accuracy
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {mutation.isError && (
            <Card className="border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Prediction Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {mutation.error?.message || 'An error occurred while predicting'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          {!mutation.isSuccess && !mutation.isError && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Our AI-powered predictor uses an ensemble of machine learning models trained on
                  4,744+ sales records.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>99.62% R² accuracy</li>
                  <li>Trained on 7 store data</li>
                  <li>Considers category, weight, and market trends</li>
                  <li>Real-time predictions</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Prediction History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Predictions</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csv = [
                    ['Timestamp', 'Category', 'Weight (g)', 'Predicted Sales'],
                    ...history.map(h => [
                      h.timestamp.toLocaleString(),
                      h.request.category,
                      h.request.net_weight,
                      h.result.toFixed(2)
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `predictions_${Date.now()}.csv`;
                  a.click();
                }}
              >
                Export to CSV
              </Button>
            </CardTitle>
            <CardDescription>
              Your last {history.length} prediction{history.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.request.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.request.net_weight}g
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                      ₹{item.result.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>
            Details about the prediction ensemble model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">R² Score</p>
              <p className="text-2xl font-bold text-primary">99.62%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Training Data</p>
              <p className="text-2xl font-bold">4,744</p>
              <p className="text-xs text-muted-foreground">sales records</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-muted-foreground">product types</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Base Models</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">ensemble members</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
