# 🚀 Quick Access Guide - AgriSmart

## 🎯 Most Important Files (Easy Access)

### 🤖 **ML & AI Core**
```bash
# Main ML algorithm (Random Forest)
src/convex/mlPrediction.ts

# ML prediction UI component
src/components/MLPredictionCard.tsx

# Historical data processing
src/convex/historicalData.ts
```

### 🗄️ **Database & Data**
```bash
# MySQL setup (run this first)
database/setup_mysql.sql

# Data import script (run after MySQL setup)
scripts/import_training_data_mysql.cjs

# MySQL connection code
src/lib/database_mysql.ts

# Training datasets
data/crop_yield_dataset (1).csv
data/Custom_Crops_yield_Historical_Dataset (1).csv
```

### 📱 **Main Application**
```bash
# Main dashboard (primary UI)
src/pages/Dashboard.tsx

# App entry point
src/main.tsx

# Landing page
src/pages/Landing.tsx
```

### ⚙️ **Configuration**
```bash
# Dependencies & scripts
package.json

# TypeScript config
tsconfig.json

# Build configuration
vite.config.ts
```

## 🔧 Development Commands

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

### Database Setup
```bash
# 1. Run MySQL setup commands from:
database/setup_mysql.sql

# 2. Import training data:
node scripts/import_training_data_mysql.cjs
```

## 📋 File Categories

### 🟢 **Essential Files** (Core functionality)
- `src/convex/mlPrediction.ts` - ML algorithms
- `src/pages/Dashboard.tsx` - Main UI
- `src/components/MLPredictionCard.tsx` - ML interface
- `database/setup_mysql.sql` - Database setup
- `package.json` - Project config

### 🟡 **Important Files** (Features & data)
- `src/convex/historicalData.ts` - Data processing
- `src/lib/database_mysql.ts` - Database connection
- `scripts/import_training_data_mysql.cjs` - Data import
- `data/` folder - Training datasets

### 🟠 **Supporting Files** (UI & utilities)
- `src/components/ui/` - UI components
- `src/pages/Landing.tsx` - Landing page
- `src/hooks/` - React hooks
- `public/` - Static assets

### ⚪ **Configuration Files** (Build & setup)
- `vite.config.ts` - Build config
- `tsconfig.*.json` - TypeScript config
- `eslint.config.js` - Code quality
- `.prettierrc` - Code formatting

## 🎯 Quick Navigation Tips

### To modify ML algorithms:
→ `src/convex/mlPrediction.ts`

### To update the main interface:
→ `src/pages/Dashboard.tsx`

### To change ML prediction UI:
→ `src/components/MLPredictionCard.tsx`

### To modify database queries:
→ `src/convex/historicalData.ts`

### To update styles:
→ `src/index.css` or component files

### To add new UI components:
→ `src/components/ui/` folder

## 🚀 Next Steps After MySQL Installation

1. ✅ Run `database/setup_mysql.sql` in MySQL
2. ✅ Run `node scripts/import_training_data_mysql.cjs`
3. ✅ Test with `npm run dev`
4. ✅ Your ML model will be ready to train!