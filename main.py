# api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import json
from pathlib import Path
from typing import List, Dict, Any

app = FastAPI(title="JewelAI API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "output"

# Global variables for loaded data
turnover_df = None
ensemble_df = None
metrics = None
ensemble_model_package = None

# Load data on startup
@app.on_event("startup")
async def load_data():
    global turnover_df, ensemble_df, metrics, ensemble_model_package
    try:
        print("Loading data files...")
        turnover_df = pd.read_csv(DATA_DIR / "inventory_turnover_predictions.csv")
        ensemble_df = pd.read_csv(DATA_DIR / "ensemble_predictions.csv")
        with open(DATA_DIR / "ensemble_metrics.json", 'r') as f:
            metrics = json.load(f)
        
        # Load ensemble model for predictions
        try:
            with open(DATA_DIR / "ensemble_model.pkl", 'rb') as f:
                ensemble_model_package = pickle.load(f)
            print("✓ Ensemble model loaded")
        except Exception as e:
            print(f"⚠ Model loading failed (predictions disabled): {e}")
        
        print("✓ Data loaded successfully")
        print(f"  - Inventory items: {len(turnover_df)}")
        print(f"  - Predictions: {len(ensemble_df)}")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        raise

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "JewelAI API is running",
        "version": "1.0.0",
        "endpoints": [
            "/api/kpis/summary",
            "/api/inventory/categories",
            "/api/analytics/performance",
            "/api/market/trends",
            "/health"
        ]
    }

# KPIs endpoint
@app.get("/api/kpis/summary")
def get_kpis():
    """Get KPI summary including total stock value, ageing stock, deadstock, and fast-moving items"""
    try:
        total_stock = float(turnover_df['predicted_potential_sales'].sum())
        
        # Use inventory_risk_score for realistic categorization (max risk ~50)
        # Ageing Stock: Items with high risk (>45) - items that move slowly
        ageing_stock = len(turnover_df[turnover_df['inventory_risk_score'] > 45])
        
        # Predicted Deadstock: Items with very high risk (>48) - potential dead inventory
        deadstock = len(turnover_df[turnover_df['inventory_risk_score'] > 48])
        
        # Fast Moving Items: Items with low risk (<30) - quick turnover items
        fast_moving = len(turnover_df[turnover_df['inventory_risk_score'] < 30])
        
        return {
            "totalStockValue": total_stock,
            "ageingStock": ageing_stock,
            "predictedDeadstock": deadstock,
            "fastMovingItems": fast_moving,
            "totalItems": len(turnover_df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Inventory categories endpoint
@app.get("/api/inventory/categories")
def get_inventory_categories():
    """Get inventory breakdown by category with stock value, turnover, and risk metrics"""
    try:
        category_summary = turnover_df.groupby('category').agg({
            'predicted_potential_sales': 'sum',
            'days_to_sell': 'mean',
            'inventory_risk_score': 'mean',
            'label_no': 'count'
        }).reset_index()
        
        category_summary.columns = ['category', 'stockValue', 'avgDaysToSell', 'riskScore', 'itemCount']
        
        # Add velocity trend
        category_summary['trend'] = category_summary['avgDaysToSell'].apply(
            lambda x: 'rising' if x < 7 else 'falling' if x > 30 else 'stable'
        )
        
        return category_summary.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoint
@app.get("/api/analytics/performance")
def get_analytics_performance():
    """Get model performance metrics and training information"""
    try:
        return {
            "ensemble": {
                "r2_score": metrics['ensemble']['r2_score'],
                "rmse": metrics['ensemble']['rmse'],
                "mae": metrics['ensemble']['mae'],
                "mape": metrics['ensemble']['mape']
            },
            "base_models": metrics['base_models'],
            "training_info": metrics['training_info']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Market trends endpoint
@app.get("/api/market/trends")
def get_market_trends():
    """Get market trends aggregated by category"""
    try:
        # Aggregate by category for market view
        trends = turnover_df.groupby('category').agg({
            'predicted_potential_sales': ['sum', 'mean'],
            'inventory_risk_score': 'mean',
            'days_to_sell': 'mean'
        }).reset_index()
        
        trends.columns = ['category', 'total_sales', 'avg_sales', 'risk', 'turnover_days']
        
        return trends.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Inventory details endpoint
@app.get("/api/inventory/items")
def get_inventory_items(category: str = None, risk_min: float = 0, risk_max: float = 100):
    """Get detailed inventory items with optional filtering"""
    try:
        df = turnover_df.copy()
        
        # Apply filters
        if category:
            df = df[df['category'] == category.upper()]
        df = df[(df['inventory_risk_score'] >= risk_min) & (df['inventory_risk_score'] <= risk_max)]
        
        # Select relevant columns
        result = df[['label_no', 'category', 'predicted_potential_sales', 
                     'days_to_sell', 'inventory_risk_score', 'turnover_category']].to_dict('records')
        
        return {
            "total": len(result),
            "items": result[:100]  # Limit to 100 items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prediction request schema
class PredictionRequest(BaseModel):
    category: str
    net_weight: float
    voucher_date: str
    purity: float = 22.0
    store_id: str = "MAIN_STORE"

# Prediction endpoint (Phase 4)
@app.post("/api/predict/sales")
def predict_sales(request: PredictionRequest):
    """Predict sales value for a new item (requires loaded model)"""
    if ensemble_model_package is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        from datetime import datetime
        
        # Parse date
        date_obj = datetime.strptime(request.voucher_date, '%Y-%m-%d')
        
        # Calculate price per gram (estimated)
        price_per_gram = 6000 if request.purity == 22 else 5500 if request.purity == 18 else 6500
        
        # Create feature dictionary with all 35 features
        features = {
            # Date features
            'year': date_obj.year,
            'month': date_obj.month,
            'day': date_obj.day,
            'day_of_week': date_obj.weekday(),
            'week_of_year': date_obj.isocalendar()[1],
            'is_weekend': 1 if date_obj.weekday() >= 5 else 0,
            'is_festival': 0,  # Simplified
            
            # Numeric features
            'net_weight': request.net_weight,
            'price_per_gram': price_per_gram,
            'market_share': 13.0,
            'category_avg_market': 90000,
            'store_avg_sales': 95000,
            'sales_momentum': 92000,
            
            # Product category (one-hot encoded)
            'product_category_GOLD BRACELET': 1 if request.category.upper() in ['BRACELET', 'GOLD BRACELET'] else 0,
            'product_category_GOLD CHAINS': 1 if request.category.upper() in ['CHAIN', 'GOLD CHAINS'] else 0,
            'product_category_GOLD EARRING': 1 if request.category.upper() in ['EARRING', 'GOLD EARRING'] else 0,
            'product_category_GOLD NECKLACE': 1 if request.category.upper() in ['NECKLACE', 'GOLD NECKLACE'] else 0,
            'product_category_GOLD RINGS': 1 if request.category.upper() in ['RING', 'GOLD RINGS'] else 0,
            
            # Weight category (one-hot encoded)
            'weight_category_Light': 1 if request.net_weight < 5 else 0,
            'weight_category_Medium': 1 if 5 <= request.net_weight < 10 else 0,
            'weight_category_Heavy': 1 if 10 <= request.net_weight < 20 else 0,
            'weight_category_Very_Heavy': 1 if 20 <= request.net_weight < 50 else 0,
            'weight_category_Ultra_Heavy': 1 if request.net_weight >= 50 else 0,
            
            # Price bracket (one-hot encoded)
            'price_bracket_Budget': 1 if price_per_gram * request.net_weight < 20000 else 0,
            'price_bracket_Mid': 1 if 20000 <= price_per_gram * request.net_weight < 50000 else 0,
            'price_bracket_Premium': 1 if 50000 <= price_per_gram * request.net_weight < 100000 else 0,
            'price_bracket_Luxury': 1 if 100000 <= price_per_gram * request.net_weight < 200000 else 0,
            'price_bracket_Ultra': 1 if price_per_gram * request.net_weight >= 200000 else 0,
            
            # Store ID (one-hot encoded)
            'store_id_MAIN_STORE': 1 if request.store_id == 'MAIN_STORE' else 0,
            'store_id_STORE_1': 1 if request.store_id == 'STORE_1' else 0,
            'store_id_STORE_2': 1 if request.store_id == 'STORE_2' else 0,
            'store_id_STORE_3': 1 if request.store_id == 'STORE_3' else 0,
            'store_id_STORE_4': 1 if request.store_id == 'STORE_4' else 0,
            'store_id_STORE_5': 1 if request.store_id == 'STORE_5' else 0,
            'store_id_STORE_6': 1 if request.store_id == 'STORE_6' else 0,
        }
        
        # Create DataFrame in the correct order
        feature_columns = ensemble_model_package['feature_columns']
        X = pd.DataFrame([features])[feature_columns]
        
        # Scale features
        scaler = ensemble_model_package['scaler']
        X_scaled = scaler.transform(X)
        
        # Ensemble prediction
        base_models = ensemble_model_package['base_models']
        weights = ensemble_model_package['weights']
        
        predictions = []
        for model_name, model in base_models.items():
            pred = model.predict(X_scaled)[0]
            predictions.append(pred)
        
        ensemble_pred = sum(w * p for w, p in zip(weights, predictions))
        
        return {
            "predicted_sales": float(ensemble_pred),
            "confidence": weights.tolist(),
            "input": request.dict(),
            "category": request.category,
            "weight_grams": request.net_weight
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Prediction comparison endpoint for charts
@app.get("/api/analytics/predictions")
def get_prediction_comparison(limit: int = 50):
    """Get sample of actual vs predicted sales for visualization"""
    try:
        # Get a sample of predictions
        sample = ensemble_df.head(limit)
        
        comparison = []
        for _, row in sample.iterrows():
            comparison.append({
                'actual': float(row['actual_sales']),
                'predicted': float(row['ensemble_prediction']),
                'category': row.get('product_category', 'Unknown') if 'product_category' in row else 'Unknown',
            })
        
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
def health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "data_loaded": turnover_df is not None,
        "model_loaded": ensemble_model_package is not None,
        "inventory_items": len(turnover_df) if turnover_df is not None else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
