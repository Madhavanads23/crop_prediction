import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Leaf, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface CropPrediction {
  crop: string;
  predictedYield: number;
  confidence: number;
  recommendation: string;
  suitabilityScore: number;
  marketPrice?: number;
  marketTrend?: string;
}

interface CropRecommendationsPanelProps {
  predictions: CropPrediction[];
  location: string;
  realTimeWeather?: any;
}

export function CropRecommendationsPanel({ predictions, location, realTimeWeather }: CropRecommendationsPanelProps) {
  const getCropIcon = (crop: string) => {
    const icons: Record<string, string> = {
      'Rice': '🌾',
      'Wheat': '🌾',
      'Cotton': '☁️',
      'Sugarcane': '🎋',
      'Onion': '🧅',
      'Tomato': '🍅',
      'Potato': '🥔',
      'Soybean': '🫘',
      'Groundnut': '🥜',
      'Maize': '🌽',
      'Corn': '🌽'
    };
    return icons[crop] || '🌱';
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Moderate';
    return 'Poor';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Best Crop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-green-600" />
              Top Recommendation for {location}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl mb-3">{getCropIcon(predictions[0].crop)}</div>
              <div className="text-3xl font-bold text-green-800 mb-2">{predictions[0].crop}</div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {predictions[0].predictedYield.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">kg/hectare</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{predictions[0].confidence}%</div>
                  <div className="text-sm text-gray-600">suitability</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-green-800">{predictions[0].recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All 5 Crop Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Complete Crop Analysis (Top 5)
          </CardTitle>
          <CardDescription>
            Detailed suitability analysis based on current conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((crop, index) => (
              <motion.div
                key={crop.crop}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSuitabilityColor(crop.suitabilityScore)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getRankIcon(index)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCropIcon(crop.crop)}</span>
                        <span className="font-bold text-lg text-gray-900">{crop.crop}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${getSuitabilityColor(crop.suitabilityScore)}`}
                      >
                        {getSuitabilityLabel(crop.suitabilityScore)} Match
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {crop.predictedYield.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">kg/hectare</div>
                  </div>
                </div>

                {/* Suitability Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Suitability Score</span>
                    <span className="text-sm font-medium">{crop.suitabilityScore}%</span>
                  </div>
                  <Progress 
                    value={crop.suitabilityScore} 
                    className="h-2"
                  />
                </div>

                {/* Crop Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{crop.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rank:</span>
                    <span className="font-medium">#{index + 1} of 5</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {crop.recommendation}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Impact Analysis */}
      {realTimeWeather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-blue-600" />
                Current Weather Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(realTimeWeather.temperature)}°C
                  </div>
                  <div className="text-sm text-gray-600">Temperature</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(realTimeWeather.humidity)}%
                  </div>
                  <div className="text-sm text-gray-600">Humidity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(realTimeWeather.rainfall)}mm
                  </div>
                  <div className="text-sm text-gray-600">Rainfall</div>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-blue-800 text-sm leading-relaxed">
                  <strong>Weather Conditions:</strong> {realTimeWeather.weatherDescription} • 
                  Current conditions are <strong>
                    {realTimeWeather.temperature >= 20 && realTimeWeather.temperature <= 30 ? 
                      'favorable' : 'challenging'}
                  </strong> for most recommended crops. 
                  {realTimeWeather.rainfall > 0 && ' Natural rainfall detected - adjust irrigation accordingly.'}
                  {realTimeWeather.humidity > 80 && ' High humidity may increase disease risk.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}