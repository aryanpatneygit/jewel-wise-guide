// src/services/apiService.ts
// LOCAL-ONLY MODE: Uses only local JSON files from /public/data/

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
  // Fetch KPIs from local JSON file
  async fetchKPIs(): Promise<KPIData> {
    const response = await fetch('/data/kpis.json');
    if (!response.ok) throw new Error('Failed to fetch KPIs from local data');
    return response.json();
  }

  // Fetch inventory categories from local JSON file
  async fetchInventoryCategories(): Promise<InventoryCategory[]> {
    const response = await fetch('/data/inventory.json');
    if (!response.ok) throw new Error('Failed to fetch inventory from local data');
    return response.json();
  }

  // Fetch market trends from local JSON file
  async fetchMarketTrends(): Promise<MarketTrend[]> {
    const response = await fetch('/data/market.json');
    if (!response.ok) throw new Error('Failed to fetch market trends from local data');
    return response.json();
  }

  // Fetch or generate analytics performance data
  async fetchAnalyticsPerformance(): Promise<AnalyticsPerformance> {
    const response = await fetch('/data/analytics.json');
    if (!response.ok) {
      // Return mock data if analytics.json doesn't exist
      return {
        ensemble: {
          r2_score: 0.85,
          rmse: 15234.5,
          mae: 12345.6,
          mape: 8.5,
        },
        base_models: {
          random_forest: { r2_score: 0.82 },
          xgboost: { r2_score: 0.84 },
          lightgbm: { r2_score: 0.83 },
        },
        training_info: {
          training_samples: 250,
          test_samples: 50,
        },
      };
    }
    return response.json();
  }

  // Generate mock prediction comparison data for analytics charts
  async fetchPredictionComparison(limit: number = 50): Promise<Array<{
    actual: number;
    predicted: number;
    category: string;
  }>> {
    // Generate realistic mock comparison data based on local inventory
    const categories = ['BANGLE', 'BRACELET', 'CHAIN', 'EARRING', 'NECKLACE', 'PENDANT', 'RING'];
    const data = [];
    
    for (let i = 0; i < limit; i++) {
      const category = categories[i % categories.length];
      const actual = Math.random() * 1000000 + 100000;
      const predicted = actual * (0.85 + Math.random() * 0.3); // Within ±15% accuracy
      data.push({ actual, predicted, category });
    }
    
    return data;
  }

  // Generate mock inventory items based on local category data
  async fetchInventoryItems(
    category?: string,
    riskMin: number = 0,
    riskMax: number = 100
  ): Promise<{ total: number; items: InventoryItem[] }> {
    const inventoryData = await this.fetchInventoryCategories();
    const items: InventoryItem[] = [];
    
    inventoryData.forEach((cat, catIndex) => {
      if (category && cat.category !== category) return;
      
      // Generate sample items for this category
      for (let i = 0; i < Math.min(cat.itemCount, 20); i++) {
        const risk = cat.riskScore + (Math.random() * 20 - 10);
        if (risk >= riskMin && risk <= riskMax) {
          items.push({
            label_no: `${cat.category.substring(0, 3)}-${catIndex}${i.toString().padStart(3, '0')}`,
            category: cat.category,
            predicted_potential_sales: cat.stockValue / cat.itemCount,
            days_to_sell: cat.avgDaysToSell,
            inventory_risk_score: Math.max(0, Math.min(100, risk)),
            turnover_category: risk > 70 ? 'Slow' : risk > 40 ? 'Medium' : 'Fast',
          });
        }
      }
    });
    
    return { total: items.length, items };
  }

  // Mock sales prediction for local-only mode
  async predictSales(request: PredictionRequest): Promise<PredictionResponse> {
    // Base prices per gram for different categories (in INR)
    const basePrice = {
      'BANGLE': 150000,
      'BRACELET': 120000,
      'CHAIN': 180000,
      'EARRING': 80000,
      'NECKLACE': 200000,
      'PENDANT': 50000,
      'RING': 40000,
    };
    
    const categoryUpper = request.category.toUpperCase();
    const base = basePrice[categoryUpper as keyof typeof basePrice] || 100000;
    const predicted_sales = base * request.net_weight * 0.8;
    
    return {
      predicted_sales,
      confidence: [predicted_sales * 0.85, predicted_sales * 1.15],
      input: request,
      category: categoryUpper,
      weight_grams: request.net_weight,
    };
  }

  // Health check for local mode
  async checkHealth(): Promise<{
    status: string;
    data_loaded: boolean;
    model_loaded: boolean;
    inventory_items: number;
  }> {
    const inventory = await this.fetchInventoryCategories();
    const totalItems = inventory.reduce((sum, cat) => sum + cat.itemCount, 0);
    
    return {
      status: 'healthy (local mode)',
      data_loaded: true,
      model_loaded: true,
      inventory_items: totalItems,
    };
  }
}

export const apiService = new APIService();
