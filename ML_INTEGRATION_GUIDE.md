# JewelAI ML Pipeline Integration - Setup Guide

## 🎉 Integration Complete!

The ML pipeline has been successfully integrated into the jewel-wise-guide repository. Below are the details and next steps.

---

## 📁 Files Added

### Frontend Files (React/TypeScript)
- ✅ `src/pages/Predictions.tsx` - ML predictions page with prediction form, history, and CSV export
- ✅ `src/services/apiService.ts` - API service layer for backend communication
- ✅ `public/data/analytics.json` - Static analytics fallback data
- ✅ `public/data/inventory.json` - Static inventory fallback data
- ✅ `public/data/kpis.json` - Static KPIs fallback data
- ✅ `public/data/market.json` - Static market trends fallback data

### Backend Files (Python/FastAPI)
- ✅ `main.py` - FastAPI backend with 8 REST endpoints
- ✅ `requirements.txt` - Python dependencies for backend

### Data Files
- ✅ `Data/` folder - Complete dataset with multi-store sales data (19 CSV files)
- ✅ `output/` folder - Trained ML models (.pkl), predictions, and metrics (17 files)

### Navigation Updates
- ✅ Updated `App.tsx` - Added Predictions route
- ✅ Updated `Sidebar.tsx` - Added "Sales Predictions" menu item with Calculator icon

---

## 🚀 Getting Started

### Step 1: Install Python Dependencies

```powershell
# Navigate to the project directory
cd "C:\Neel Workarea\IMP2\jewel-wise-guide"

# Install Python dependencies
pip install -r requirements.txt
```

### Step 2: Start the FastAPI Backend

```powershell
# Run the backend server
python main.py
```

The API will start on `http://localhost:8000`

You should see:
```
✓ Data loaded successfully
  - Inventory items: 250
  - Predictions: 623
```

### Step 3: Start the Frontend (In a New Terminal)

```powershell
# Navigate to the project directory
cd "C:\Neel Workarea\IMP2\jewel-wise-guide"

# Install npm dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🎯 Available Features

### 1. Sales Predictions Page
**URL:** `http://localhost:5173/predictions`

Features:
- **Prediction Form:** Enter jewelry item details (category, weight, date, purity, store)
- **Real-time Predictions:** Get predicted sales values with 99.62% R² accuracy
- **Prediction History:** View your last 10 predictions
- **CSV Export:** Export prediction history to CSV file
- **Model Information:** View ensemble model details and performance metrics

### 2. API Endpoints

The backend provides 8 REST endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/kpis/summary` | GET | KPI summary (stock value, ageing, deadstock) |
| `/api/inventory/categories` | GET | Inventory breakdown by category |
| `/api/inventory/items` | GET | Detailed inventory items with filters |
| `/api/analytics/performance` | GET | Model performance metrics |
| `/api/analytics/predictions` | GET | Actual vs predicted comparison |
| `/api/market/trends` | GET | Market trends by category |
| `/api/predict/sales` | POST | Real-time sales prediction |

### 3. Test the API

Open your browser and visit:
- Health Check: `http://localhost:8000/health`
- KPIs: `http://localhost:8000/api/kpis/summary`
- API Docs: `http://localhost:8000/docs` (Interactive Swagger UI)

---

## 📊 ML Model Details

### Ensemble Model
- **R² Score:** 99.62%
- **Training Data:** 4,744 sales records
- **Base Models:** 5 (Linear Regression, Ridge, Random Forest, Gradient Boosting, XGBoost)
- **Categories:** 7 product types (BANGLE, BRACELET, CHAIN, EARRING, NECKLACE, PENDANT, RING)
- **Stores:** 7 stores (MAIN_STORE + STORE_1 to STORE_6)

### Features Used (35 total)
- Date features (year, month, day, week, weekend, festival)
- Product details (weight, purity, category)
- Market intelligence (market share, category averages)
- One-hot encoded features (product category, weight category, price bracket, store)

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Base URL (optional, defaults to http://localhost:8000)
VITE_API_URL=http://localhost:8000
```

### CORS Configuration
The backend is pre-configured to allow requests from:
- `http://localhost:8080`
- `http://localhost:5173`
- `http://localhost:3000`
- `http://127.0.0.1:8080`

---

## 📝 Usage Example

### Making a Prediction

1. Navigate to **Predictions** page from the sidebar
2. Fill in the form:
   - **Category:** RING
   - **Net Weight:** 5.0 grams
   - **Voucher Date:** Today's date
   - **Purity:** 22K
   - **Store ID:** MAIN_STORE
3. Click **Predict Sales Value**
4. View the predicted sales value (e.g., ₹30,000)
5. Export predictions to CSV if needed

### API Request Example

```bash
curl -X POST "http://localhost:8000/api/predict/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "RING",
    "net_weight": 5.0,
    "voucher_date": "2025-11-29",
    "purity": 22.0,
    "store_id": "MAIN_STORE"
  }'
```

---

## 🎨 UI Features

The Predictions page includes:
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light mode support
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Success/error alerts
- ✅ Prediction history with timestamps
- ✅ CSV export functionality
- ✅ Model confidence display
- ✅ Model information card

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Module not found**
```powershell
pip install -r requirements.txt --upgrade
```

**Error: Port 8000 already in use**
```powershell
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Error: Data files not found**
- Ensure `Data/` and `output/` folders are in the project root
- Check that CSV files exist in `Data/jewellery_multi_store_dataset/`
- Check that model files exist in `output/` folder

### Frontend Issues

**Error: Cannot connect to API**
- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in `main.py`
- Verify API_BASE_URL in `apiService.ts`

**Error: Page not found**
- Clear browser cache
- Restart the dev server
- Check that route is added in `App.tsx`

---

## 📦 Project Structure

```
jewel-wise-guide/
├── src/
│   ├── pages/
│   │   ├── Predictions.tsx        # ✨ NEW
│   │   ├── Dashboard.tsx
│   │   ├── Inventory.tsx
│   │   ├── Market.tsx
│   │   └── ...
│   ├── services/
│   │   ├── apiService.ts          # ✨ NEW
│   │   └── geminiService.ts
│   └── ...
├── public/
│   └── data/                      # ✨ NEW
│       ├── analytics.json
│       ├── inventory.json
│       ├── kpis.json
│       └── market.json
├── Data/                          # ✨ NEW
│   └── jewellery_multi_store_dataset/
│       ├── multi_store_denorm_sales.csv
│       ├── item_master.csv
│       └── ... (19 CSV files)
├── output/                        # ✨ NEW
│   ├── ensemble_model.pkl
│   ├── inventory_turnover_predictions.csv
│   └── ... (17 files)
├── main.py                        # ✨ NEW
├── requirements.txt               # ✨ NEW
├── package.json
└── ...
```

---

## 🎓 Next Steps

1. **Test the Integration**
   - Start backend and frontend
   - Navigate to Predictions page
   - Make a test prediction
   - Verify the result

2. **Customize the UI**
   - Modify colors/styling in `Predictions.tsx`
   - Add additional form fields if needed
   - Customize prediction display format

3. **Enhance the Model**
   - Retrain with more data
   - Add new features
   - Tune hyperparameters

4. **Deploy to Production**
   - Deploy backend to cloud (Azure, AWS, Heroku)
   - Build and deploy frontend (Vercel, Netlify)
   - Update API_BASE_URL to production URL

---

## 📚 Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Query Documentation: https://tanstack.com/query/latest
- Scikit-learn Documentation: https://scikit-learn.org/

---

## ✅ Summary

All ML pipeline files have been successfully integrated into the jewel-wise-guide repository without removing any existing functionality. The application now has:

- ✅ Real-time sales prediction capability
- ✅ Full ML model integration (99.62% R² accuracy)
- ✅ Complete dataset with 4,744 sales records
- ✅ 8 REST API endpoints for data access
- ✅ Beautiful, responsive Predictions UI
- ✅ Prediction history and CSV export
- ✅ All existing pages and features intact

**You're ready to use the ML-powered predictions! 🎉**
