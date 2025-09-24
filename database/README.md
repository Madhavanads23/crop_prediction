# AgriSmart Advisor - PostgreSQL Integration Guide

## 📋 Overview

This guide explains how to integrate PostgreSQL with the AgriSmart Advisor project to store and utilize the historical crop yield dataset for enhanced AI-powered recommendations.

## 🗄️ Database Schema

The PostgreSQL database includes the following main tables:

### Core Tables
- **`states`** - Master table of Indian states
- **`districts`** - Master table of districts 
- **`crops`** - Master table of crops with categories
- **`historical_crop_data`** - Main table with 50,000+ yield records
- **`soil_crop_suitability`** - Soil-crop compatibility matrix
- **`weather_patterns`** - Aggregated weather data by region/month

### Enhanced Tables
- **`yield_predictions`** - ML model predictions
- **`market_price_history`** - Historical price trends
- **`user_recommendations_enhanced`** - Enhanced recommendation history

## 🚀 Setup Instructions

### Prerequisites
1. **PostgreSQL 12+** installed and running
2. **Node.js 18+** 
3. **pnpm** package manager
4. Historical dataset CSV file in project root

### Windows Setup
```powershell
# Run the PowerShell setup script
.\database\setup.ps1

# Or with custom parameters
.\database\setup.ps1 -DBName "custom_db" -DBUser "custom_user"
```

### Linux/Mac Setup  
```bash
# Make script executable
chmod +x database/setup.sh

# Run the setup script
./database/setup.sh
```

### Manual Setup
1. **Create Database:**
   ```sql
   CREATE DATABASE agrismart_db;
   CREATE USER agrismart_user WITH PASSWORD 'agrismart_password_2025';
   GRANT ALL PRIVILEGES ON DATABASE agrismart_db TO agrismart_user;
   ```

2. **Create Schema:**
   ```bash
   psql -U agrismart_user -d agrismart_db -f database/schema.sql
   ```

3. **Import Data:**
   ```bash
   # Import CSV to temp table
   \copy temp_crop_data FROM 'Custom_Crops_yield_Historical_Dataset (1).csv' DELIMITER ',' CSV HEADER;
   
   # Process and import
   psql -U agrismart_user -d agrismart_db -f database/import_data.sql
   ```

## 🔧 Configuration

### Environment Variables
Copy `database/.env.example` to `.env.local`:

```env
DATABASE_URL=postgresql://agrismart_user:agrismart_password_2025@localhost:5432/agrismart_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=agrismart_db
POSTGRES_USER=agrismart_user
POSTGRES_PASSWORD=agrismart_password_2025
```

### Install Dependencies
```bash
pnpm install pg @types/pg dotenv
```

## 📊 Dataset Details

### Historical Crop Data (50,767 records)
- **Time Range:** 1966-2024
- **Geographic Coverage:** All Indian states and districts
- **Crops:** Rice, Wheat, Maize, Cotton, Sugarcane, etc.
- **Data Points:**
  - Yield (kg/hectare)
  - Area cultivated (hectares)  
  - Nutrient requirements (N, P, K)
  - Environmental factors (temperature, humidity, rainfall, pH)
  - Solar radiation and wind speed

### Key Metrics
- **States:** 36 Indian states/territories
- **Districts:** 700+ districts
- **Crops:** 10+ major crops
- **Years:** 58+ years of historical data

## 🧠 Enhanced AI Features

### 1. Historical Yield Analysis
```typescript
// Get 10-year yield trends for specific crops and regions
const yieldData = await getHistoricalYieldData({
  stateName: "Punjab",
  districtName: "Amritsar", 
  cropNames: ["rice", "wheat"],
  yearsBack: 10
});
```

### 2. ML-Enhanced Crop Suitability
```typescript
// Get crop recommendations with ML confidence scores
const recommendations = await getCropSuitabilityML({
  soilType: "loam",
  stateName: "Karnataka",
  districtName: "Bangalore Rural",
  targetYield: 5000
});
```

### 3. Weather Pattern Analysis
```typescript
// Get historical weather patterns for optimal planning
const patterns = await getWeatherPatterns({
  stateName: "Maharashtra",
  months: [6, 7, 8] // Monsoon months
});
```

### 4. Optimal Planting Predictions
```typescript
// Predict best planting times based on historical yields
const planting = await predictOptimalPlanting({
  cropName: "rice",
  stateName: "West Bengal", 
  soilType: "clay"
});
```

## 🎯 Integration with Convex

### Enhanced Recommendation Flow
1. **User Input:** Region + Soil Type
2. **Historical Analysis:** Query PostgreSQL for yield patterns
3. **Weather Correlation:** Analyze weather impact on yields
4. **ML Scoring:** Calculate confidence-weighted recommendations  
5. **Market Integration:** Combine with existing market data
6. **Final Recommendations:** Return ranked suggestions with evidence

### New Convex Functions
- `getHistoricalYieldData` - Historical yield analysis
- `getCropSuitabilityML` - ML-enhanced suitability scoring
- `getWeatherPatterns` - Regional weather analysis
- `predictOptimalPlanting` - Optimal timing predictions

## 📈 Performance Optimizations

### Database Indexes
```sql
-- Optimized for common query patterns
CREATE INDEX idx_historical_data_composite ON historical_crop_data(state_code, dist_code, crop_id, year);
CREATE INDEX idx_historical_data_recent ON historical_crop_data(year DESC, state_code, crop_id) WHERE year >= 2010;
```

### Connection Pooling
- Maximum 20 connections
- 30-second idle timeout
- Connection recycling for performance

### Caching Strategy
- Weather data: 6-hour cache
- Market data: 24-hour cache  
- Historical data: 30-day refresh cycle

## 🔍 Data Quality

### Validation Checks
- Yield values: Positive and realistic ranges
- Temperature: -10°C to 60°C range
- Rainfall: 0-5000mm range
- Area: Positive hectare values

### Data Completeness
- **99.8%** complete records
- Missing values handled via interpolation
- Outlier detection and flagging

## 🚀 Benefits of PostgreSQL Integration

### 1. **Enhanced Accuracy**
- Real historical yield data vs synthetic data
- 58+ years of proven agricultural patterns
- Regional specificity with district-level data

### 2. **ML-Ready Dataset**
- Structured data for training models
- Multiple environmental variables
- Time-series data for trend analysis

### 3. **Scalable Architecture** 
- Handles large datasets efficiently
- Optimized queries for real-time recommendations
- Expandable for additional data sources

### 4. **Advanced Analytics**
- Yield trend analysis
- Climate impact correlations
- Seasonal optimization insights
- Risk assessment capabilities

## 🔧 Troubleshooting

### Common Issues

**Connection Failed:**
```bash
# Check PostgreSQL service
systemctl status postgresql  # Linux
Get-Service postgresql*      # Windows
```

**Import Errors:**
```bash
# Check file encoding (should be UTF-8)
file -i "Custom_Crops_yield_Historical_Dataset (1).csv"

# Check permissions
ls -la *.csv
```

**Memory Issues:**
```sql
-- Increase work_mem for large imports
SET work_mem = '256MB';
```

### Performance Tuning
```sql
-- Analyze tables after import
ANALYZE historical_crop_data;
ANALYZE weather_patterns;

-- Update statistics
VACUUM ANALYZE;
```

## 📚 Next Steps

1. **Install Dependencies:** `pnpm install`
2. **Setup Database:** Run setup script
3. **Configure Environment:** Update `.env.local`
4. **Test Connection:** Run health check
5. **Update Frontend:** Integrate new recommendation features
6. **Deploy:** Update production configuration

This PostgreSQL integration transforms AgriSmart Advisor from a rule-based system to a truly data-driven AI platform with historical evidence backing every recommendation.