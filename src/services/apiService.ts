// src/services/apiService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface KPIData {
  totalStockValue: number;
  ageingStock: number;
  predictedDeadstock: number;
  fastMovingItems: number;
  totalItems: number;
}

export interface InventoryCategory {
  category: string;
  stockValue: number;
  avgDaysToSell: number;
  riskScore: number;
  itemCount: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface AnalyticsPerformance {
  ensemble: {
    r2_score: number;
    rmse: number;
    mae: number;
    mape: number;
  };
  base_models: Record<string, any>;
  training_info: Record<string, any>;
}

export interface MarketTrend {
  category: string;
  total_sales: number;
  avg_sales: number;
  risk: number;
  turnover_days: number;
}

export interface InventoryItem {
  label_no: string;
  category: string;
  predicted_potential_sales: number;
  days_to_sell: number;
  inventory_risk_score: number;
  turnover_category: string;
}

export interface PredictionRequest {
  category: string;
  net_weight: number;
  voucher_date: string;
  purity?: number;
  store_id?: string;
}

export interface PredictionResponse {
  predicted_sales: number;
  confidence: number[];
  input: PredictionRequest;
  category: string;
  weight_grams: number;
}

class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchKPIs(): Promise<KPIData> {
    const response = await fetch(`${this.baseUrl}/api/kpis/summary`);
    if (!response.ok) throw new Error('Failed to fetch KPIs');
    return response.json();
  }

  async fetchInventoryCategories(): Promise<InventoryCategory[]> {
    const response = await fetch(`${this.baseUrl}/api/inventory/categories`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  }

  async fetchAnalyticsPerformance(): Promise<AnalyticsPerformance> {
    const response = await fetch(`${this.baseUrl}/api/analytics/performance`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }

  async fetchPredictionComparison(limit: number = 50): Promise<Array<{
    actual: number;
    predicted: number;
    category: string;
  }>> {
    const response = await fetch(`${this.baseUrl}/api/analytics/predictions?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch prediction comparison');
    return response.json();
  }

  async fetchMarketTrends(): Promise<MarketTrend[]> {
    const response = await fetch(`${this.baseUrl}/api/market/trends`);
    if (!response.ok) throw new Error('Failed to fetch market trends');
    return response.json();
  }

  async fetchInventoryItems(
    category?: string,
    riskMin: number = 0,
    riskMax: number = 100
  ): Promise<{ total: number; items: InventoryItem[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('risk_min', riskMin.toString());
    params.append('risk_max', riskMax.toString());

    const response = await fetch(
      `${this.baseUrl}/api/inventory/items?${params.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch inventory items');
    return response.json();
  }

  async predictSales(request: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/api/predict/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to predict sales');
    }
    return response.json();
  }

  async checkHealth(): Promise<{
    status: string;
    data_loaded: boolean;
    model_loaded: boolean;
    inventory_items: number;
  }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('API health check failed');
    return response.json();
  }
}

export const apiService = new APIService();
