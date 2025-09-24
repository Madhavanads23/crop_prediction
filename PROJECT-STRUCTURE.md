# 📁 AgriSmart Project Structure - Updated & Organized

## �️ Clean Directory Organization (Post-Cleanup)

```
agrismart-main/
├── 📁 src/                          # Main source code
│   ├── 📁 components/               # React components
│   ├── 📁 pages/                    # Page components
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 lib/                      # Utility libraries
│   ├── 📁 types/                    # TypeScript type definitions
│   └── 📁 convex/                   # Convex backend functions
├── 📁 public/                       # Static assets
├── 📁 database/                     # Database setup and schema
│   ├── schema.sql                   # PostgreSQL database schema
│   ├── import-data.sql              # Data import scripts
│   ├── setup.ps1                    # Windows setup script
│   └── setup.sh                     # Linux/Mac setup script
├── 📁 data/                         # CSV datasets
│   ├── Custom_Crops_yield_Historical_Dataset (1).csv
│   └── crop_yield_dataset (1).csv
├── 📁 scripts/                      # Setup and utility scripts
│   ├── set-convex-jwt-env.sh
│   ├── setup-backend-env.sh
│   └── setup.sh
├── 📁 docs/                         # Documentation
├── 📄 package.json                  # Dependencies and scripts
├── 📄 pnpm-lock.yaml               # Lock file
├── 📄 vite.config.ts               # Vite configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 eslint.config.js             # ESLint configuration
├── 📄 components.json              # Shadcn UI configuration
├── 📄 convex.json                  # Convex configuration
└── 📄 README.md                    # Project documentation
```

## 🗂️ Key Directories

### `/src` - Main Application Code
- **components/**: Reusable UI components (forms, charts, cards)
- **pages/**: Route-based page components (Landing, Dashboard, Auth)
- **hooks/**: Custom React hooks for auth and mobile detection
- **lib/**: Utility functions and database connections
- **convex/**: Backend API functions and data operations

### `/database` - Database Setup
- **schema.sql**: Complete PostgreSQL database schema
- **import-data.sql**: Scripts to import historical crop data
- **setup scripts**: Automated database setup for different platforms

### `/data` - Historical Datasets
- **Custom_Crops_yield_Historical_Dataset**: 50,767 records from 1966-2024
- **crop_yield_dataset**: Additional crop yield prediction data

### `/scripts` - Automation Scripts
- Setup scripts for environment configuration
- Backend and JWT setup utilities

## 🧹 Cleaned Up

### Removed Files:
- ❌ Duplicate PowerShell scripts
- ❌ Temporary analysis files
- ❌ Unused ml/ml_project folders
- ❌ Node.js installer files
- ❌ Development artifacts

### Organized Files:
- ✅ CSV data moved to `/data`
- ✅ Shell scripts moved to `/scripts`
- ✅ Database files consolidated in `/database`
- ✅ Documentation organized in `/docs`

## 🚀 Next Steps

1. **Database Setup**: Run `database/setup.ps1` to create PostgreSQL database
2. **Import Data**: Use `database/import-data.sql` to load historical crop data
3. **Environment Config**: Copy `.env.example` to `.env.local` and configure
4. **Start Development**: Run `pnpm dev` to start the application

Your project is now clean and organized! 🎉