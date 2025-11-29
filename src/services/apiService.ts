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
  // Helper function to filter data based on time period
  private filterByTimePeriod<T extends { voucher_date?: string; date?: string }>(
    data: T[],
    days: number
  ): T[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return data.filter(item => {
      const dateStr = item.voucher_date || item.date;
      if (!dateStr) return true; // Include items without dates
      const itemDate = new Date(dateStr);
      return itemDate >= cutoffDate;
    });
  }

  // Fetch KPIs from local JSON file with time period filter
  async fetchKPIs(timePeriodDays?: number): Promise<KPIData> {
    const response = await fetch('/data/kpis.json');
    if (!response.ok) throw new Error('Failed to fetch KPIs from local data');
    const data = await response.json();
    
    // If time period is specified, adjust the values proportionally
    if (timePeriodDays && timePeriodDays !== 30) {
      const ratio = timePeriodDays / 30; // Assuming base data is for 30 days
      return {
        ...data,
        totalStockValue: Math.round(data.totalStockValue * ratio),
        ageingStock: Math.round(data.ageingStock * ratio),
        predictedDeadstock: Math.round(data.predictedDeadstock * ratio),
        fastMovingItems: Math.round(data.fastMovingItems * ratio),
        totalItems: Math.round(data.totalItems * ratio),
      };
    }
    
    return data;
  }

  // Fetch inventory categories from local JSON file with time period filter
  async fetchInventoryCategories(timePeriodDays?: number): Promise<InventoryCategory[]> {
    const response = await fetch('/data/inventory.json');
    if (!response.ok) throw new Error('Failed to fetch inventory from local data');
    const data = await response.json();
    
    // If time period is specified, adjust the values proportionally
    if (timePeriodDays && timePeriodDays !== 30) {
      const ratio = timePeriodDays / 30; // Assuming base data is for 30 days
      return data.map((cat: InventoryCategory) => ({
        ...cat,
        stockValue: Math.round(cat.stockValue * ratio),
        itemCount: Math.round(cat.itemCount * ratio),
        avgDaysToSell: Math.round(cat.avgDaysToSell / ratio), // Inverse relationship
      }));
    }
    
    return data;
  }

  // Fetch market trends from local JSON file with time period filter
  async fetchMarketTrends(timePeriodDays?: number): Promise<MarketTrend[]> {
    const response = await fetch('/data/market.json');
    if (!response.ok) throw new Error('Failed to fetch market trends from local data');
    const data = await response.json();
    
    // If time period is specified, adjust the values proportionally
    if (timePeriodDays && timePeriodDays !== 30) {
      const ratio = timePeriodDays / 30; // Assuming base data is for 30 days
      return data.map((trend: MarketTrend) => ({
        ...trend,
        total_sales: Math.round(trend.total_sales * ratio),
        avg_sales: Math.round(trend.avg_sales * ratio),
        turnover_days: Math.round(trend.turnover_days / ratio), // Inverse relationship
      }));
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
