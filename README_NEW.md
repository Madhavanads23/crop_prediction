# 🌾 AgriSmart Advisor

**AI-Powered Agricultural Intelligence Platform**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-AgriSmart_Advisor-success?style=for-the-badge)](https://madhavanads23.github.io/crop_prediction/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/madhavanads23/crop_prediction/deploy.yml?style=flat-square&label=Build)](https://github.com/madhavanads23/crop_prediction/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)

> Professional agricultural intelligence platform providing AI-powered crop recommendations, real-time weather integration, and comprehensive agricultural analysis tools for farmers and agricultural professionals.

## ✨ Features

### 🤖 AI-Powered Analysis
- **37+ Crop Varieties**: Comprehensive database covering cereals, cash crops, oilseeds, pulses, vegetables, fruits, and spices
- **15 Soil Types**: Advanced soil compatibility analysis with 195+ crop-soil combinations
- **ML Predictions**: Machine learning algorithms for accurate crop recommendations
- **Smart Alerts**: Intelligent notifications for weather warnings and optimal farming conditions

### 🌤️ Real-Time Data Integration
- **Weather API**: Live weather data from OpenMeteo with automatic location detection
- **Market Data**: Real-time crop prices from AgMarkNet API for informed decision making
- **Location Services**: Automatic coordinate detection and regional weather insights

### 📊 Advanced Analytics
- **Interactive Charts**: Comprehensive data visualization with Recharts
- **Export Reports**: Generate detailed PDF/Excel reports for agricultural planning
- **Crop Calendar**: Seasonal planning tools with optimal planting and harvesting schedules
- **Performance Metrics**: Track and analyze agricultural performance over time

### 🎨 Professional UI/UX
- **Modern Design**: Clean, responsive interface optimized for all devices
- **Dark/Light Theme**: Customizable themes for comfortable usage
- **Smooth Animations**: Framer Motion powered interactions
- **Toast Notifications**: Real-time feedback and status updates

## 🚀 Live Demo

Visit the live application: **[AgriSmart Advisor](https://madhavanads23.github.io/crop_prediction/)**

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui Components
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **APIs**: OpenMeteo (Weather), AgMarkNet (Market Data)
- **Deployment**: GitHub Pages with GitHub Actions
- **Authentication**: Convex Auth with email OTP

## 📱 Supported Crops

### 🌾 Cereals
Rice, Wheat, Maize, Barley, Millet, Sorghum

### 💰 Cash Crops
Cotton, Sugarcane, Tobacco, Jute

### 🫘 Oilseeds
Groundnut, Sunflower, Sesame, Safflower, Mustard, Soybean

### 🫛 Pulses
Chickpea, Pigeon Pea, Black Gram, Green Gram, Lentil, Field Pea

### 🥬 Vegetables
Potato, Tomato, Onion, Cabbage, Cauliflower, Carrot, Brinjal, Okra, Cucumber, Pumpkin

### 🍎 Fruits
Apple, Banana, Orange, Mango, Grapes, Pomegranate

### 🌶️ Spices
Chili, Turmeric, Coriander, Cumin, Fenugreek

## 🌱 Soil Types Supported

Red, Black, Alluvial, Clayey, Sandy, Loamy, Silt, Peat, Chalk, Saline, Acidic, Alkaline, Volcanic, Desert, Laterite

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/madhavanads23/crop_prediction.git
   cd crop_prediction
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm build
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_CONVEX_URL=your_convex_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### API Integration
- **OpenMeteo**: No API key required (free service)
- **AgMarkNet**: Government API for Indian agricultural market data

## 📊 Project Structure

```
agrismart-main/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── CropRecommendationCard.tsx
│   │   ├── InputForm.tsx
│   │   └── WeatherChart.tsx
│   ├── pages/              # Application pages
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   └── Landing.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript definitions
│   └── convex/             # Backend functions
├── public/                 # Static assets
├── .github/workflows/      # GitHub Actions
└── dist/                   # Production build
```

## 🚀 Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages.

### Automatic Deployment
1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is available at: `https://username.github.io/crop_prediction/`

### Manual Deployment
```bash
npm run build
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Madhavan ADS**
- GitHub: [@madhavanads23](https://github.com/madhavanads23)
- LinkedIn: [Madhavan ADS](https://linkedin.com/in/madhavanads)

## 🙏 Acknowledgments

- OpenMeteo for weather data API
- AgMarkNet for agricultural market data
- Shadcn/ui for beautiful components
- Recharts for data visualization
- Indian agricultural research community

## 📈 Roadmap

- [ ] Mobile app development
- [ ] Offline functionality
- [ ] Multi-language support
- [ ] Advanced ML models
- [ ] Satellite imagery integration
- [ ] IoT sensor integration
- [ ] Community features
- [ ] Expert consultation system

---

<div align="center">
  <p>Built with ❤️ for the farming community</p>
  <p>
    <a href="https://madhavanads23.github.io/crop_prediction/">🌐 Live Demo</a> •
    <a href="#features">✨ Features</a> •
    <a href="#getting-started">🚀 Getting Started</a> •
    <a href="#contributing">🤝 Contributing</a>
  </p>
</div>