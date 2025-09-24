import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TrendingUp, Award } from 'lucide-react';
// import { useAction } from 'convex/react';
// import { api } from '@/convex/_generated/api';

// Mock hooks for development
const useAction = (action: any) => {
  return async (args: any) => {
    console.log('Mock action called:', action, args);
    return {
      success: true,
      prediction: {
        predictedYield: 2500 + Math.random() * 1000,
        confidence: 0.8 + Math.random() * 0.15,
        yieldCategory: 'Good',
        expectedProduction: 25000,
      },
      model: {
        algorithm: 'Enhanced Random Forest',
        trainingDataSize: 1076,
        features: ['temperature', 'rainfall', 'humidity', 'pH', 'nutrients', 'state', 'season'],
      },
      insights: {
        avgHistoricalYield: 2200,
        maxHistoricalYield: 3400,
        bestPerformingYear: { year: 2022, yield: 3400 },
        yieldTrend: 'increasing',
        dataQuality: 'high',
      },
    };
  };
};

const api = {
  mlPrediction: {
    predictCropYieldML: null,
    recommendCropsML: null,
  },
};

interface MLPredictionData {
  success: boolean;
  prediction?: {
    predictedYield: number;
    confidence: number;
    yieldCategory: string;
    expectedProduction: number;
  };
  model?: {
    algorithm: string;
    trainingDataSize: number;
    features: string[];
  };
  insights?: {
    avgHistoricalYield: number;
    maxHistoricalYield: number;
    bestPerformingYear: {
      year: number;
      yield: number;
    };
    yieldTrend: string;
    dataQuality: string;
  };
  error?: string;
  fallbackPrediction?: any;
}

interface CropRecommendationData {
  success: boolean;
  recommendations: Array<{
    crop: string;
    predictedYield: number;
    confidence: number;
    yieldCategory: string;
    suitabilityScore: number;
    historicalAvgYield: number;
  }>;
  metadata?: {
    algorithm: string;
    totalCropsAnalyzed: number;
    region: string;
  };
  error?: string;
}

export function MLPredictionCard() {
  const [formData, setFormData] = useState({
    stateName: '',
    districtName: '',
    cropName: '',
    temperature: '',
    rainfall: '',
    humidity: '',
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    season: '',
  });

  const [predictionResult, setPredictionResult] = useState<MLPredictionData | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<CropRecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prediction' | 'recommendation'>('prediction');

  // Mock prediction functions for demo
  const predictYield = async (args: any) => ({
    success: true,
    prediction: {
      predictedYield: 2500 + Math.random() * 1000,
      confidence: 0.8 + Math.random() * 0.15,
      yieldCategory: 'Good',
      expectedProduction: 25000,
    },
    model: {
      algorithm: 'Enhanced Random Forest',
      trainingDataSize: 1076,
      features: ['temperature', 'rainfall', 'humidity', 'pH', 'nutrients', 'state', 'season'],
    },
    insights: {
      avgHistoricalYield: 2200,
      maxHistoricalYield: 3400,
      bestPerformingYear: { year: 2022, yield: 3400 },
      yieldTrend: 'increasing',
      dataQuality: 'high',
    },
  });

  const recommendCrops = async (args: any) => ({
    success: true,
    recommendations: [
      {
        crop: 'rice',
        predictedYield: 2800,
        confidence: 0.85,
        yieldCategory: 'Good',
        suitabilityScore: 88,
        historicalAvgYield: 2400,
      },
      {
        crop: 'wheat',
        predictedYield: 2200,
        confidence: 0.79,
        yieldCategory: 'Average',
        suitabilityScore: 75,
        historicalAvgYield: 2100,
      },
      {
        crop: 'maize',
        predictedYield: 3200,
        confidence: 0.82,
        yieldCategory: 'Excellent',
        suitabilityScore: 92,
        historicalAvgYield: 2900,
      },
    ],
    metadata: {
      algorithm: 'Random Forest',
      totalCropsAnalyzed: 15,
      region: `${args.districtName || 'Sample District'}, ${args.stateName || 'Sample State'}`,
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePredictYield = async () => {
    if (!formData.stateName || !formData.districtName || !formData.cropName) {
      alert('Please fill required fields: State, District, and Crop');
      return;
    }

    setIsLoading(true);
    try {
      const result = await predictYield({
        stateName: formData.stateName,
        districtName: formData.districtName,
        cropName: formData.cropName,
        temperature: parseFloat(formData.temperature) || 25,
        rainfall: parseFloat(formData.rainfall) || 800,
        humidity: parseFloat(formData.humidity) || 70,
        ph: parseFloat(formData.ph) || 6.8,
        nitrogen: parseFloat(formData.nitrogen) || 100,
        phosphorus: parseFloat(formData.phosphorus) || 60,
        potassium: parseFloat(formData.potassium) || 40,
        season: formData.season || 'kharif',
      });

      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction error:', error);
      setPredictionResult({
        success: false,
        error: 'Failed to predict crop yield. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const handleRecommendCrops = async () => {
    if (!formData.stateName || !formData.districtName) {
      alert('Please fill State and District fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await recommendCrops({});
      setRecommendationResult(result);
    } catch (error) {
      console.error('Recommendation error:', error);
      setRecommendationResult({
        success: false,
        recommendations: [],
        error: 'Failed to get crop recommendations. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const getYieldColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'below average': return 'bg-orange-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="text-blue-500" />
          AI-Powered Crop Prediction
        </h2>
        <p className="text-gray-600">
          Get accurate crop yield predictions and recommendations using Random Forest Machine Learning
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={activeTab === 'prediction' ? 'default' : 'outline'}
          onClick={() => setActiveTab('prediction')}
          className="flex items-center gap-2"
        >
          <TrendingUp size={16} />
          Yield Prediction
        </Button>
        <Button
          variant={activeTab === 'recommendation' ? 'default' : 'outline'}
          onClick={() => setActiveTab('recommendation')}
          className="flex items-center gap-2"
        >
          <Award size={16} />
          Crop Recommendations
        </Button>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>
            Enter your location and environmental conditions for ML-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="e.g., Punjab"
                value={formData.stateName}
                onChange={(e) => handleInputChange('stateName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                placeholder="e.g., Ludhiana"
                value={formData.districtName}
                onChange={(e) => handleInputChange('districtName', e.target.value)}
              />
            </div>

            {activeTab === 'prediction' && (
              <div className="space-y-2">
                <Label htmlFor="crop">Crop *</Label>
                <Input
                  id="crop"
                  placeholder="e.g., rice, wheat"
                  value={formData.cropName}
                  onChange={(e) => handleInputChange('cropName', e.target.value)}
                />
              </div>
            )}

            {/* Environmental Conditions */}
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                placeholder="25"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rainfall">Rainfall (mm)</Label>
              <Input
                id="rainfall"
                type="number"
                placeholder="800"
                value={formData.rainfall}
                onChange={(e) => handleInputChange('rainfall', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                placeholder="70"
                value={formData.humidity}
                onChange={(e) => handleInputChange('humidity', e.target.value)}
              />
            </div>

            {/* Soil Properties */}
            <div className="space-y-2">
              <Label htmlFor="ph">Soil pH</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                placeholder="6.8"
                value={formData.ph}
                onChange={(e) => handleInputChange('ph', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nitrogen">Nitrogen (kg/ha)</Label>
              <Input
                id="nitrogen"
                type="number"
                placeholder="100"
                value={formData.nitrogen}
                onChange={(e) => handleInputChange('nitrogen', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phosphorus">Phosphorus (kg/ha)</Label>
              <Input
                id="phosphorus"
                type="number"
                placeholder="60"
                value={formData.phosphorus}
                onChange={(e) => handleInputChange('phosphorus', e.target.value)}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-2">
              <Label htmlFor="potassium">Potassium (kg/ha)</Label>
              <Input
                id="potassium"
                type="number"
                placeholder="40"
                value={formData.potassium}
                onChange={(e) => handleInputChange('potassium', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select onValueChange={(value) => handleInputChange('season', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kharif">Kharif (Summer)</SelectItem>
                  <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                  <SelectItem value="whole year">Whole Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {activeTab === 'prediction' && (
              <Button
                onClick={handlePredictYield}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
                Predict Yield
              </Button>
            )}

            {activeTab === 'recommendation' && (
              <Button
                onClick={handleRecommendCrops}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Award size={16} />}
                Get Recommendations
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {activeTab === 'prediction' && predictionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-blue-500" />
              Yield Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictionResult.success && predictionResult.prediction ? (
              <div className="space-y-6">
                {/* Main Prediction */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(predictionResult.prediction.predictedYield)} kg/ha
                    </div>
                    <div className="text-sm text-gray-600">Predicted Yield</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(predictionResult.prediction.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Badge className={getYieldColor(predictionResult.prediction.yieldCategory)}>
                      {predictionResult.prediction.yieldCategory}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-2">Yield Category</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(predictionResult.prediction.expectedProduction)} kg
                    </div>
                    <div className="text-sm text-gray-600">Expected Production</div>
                  </div>
                </div>

                {/* Model Info */}
                {predictionResult.model && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Model Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Algorithm:</span> {predictionResult.model.algorithm}
                      </div>
                      <div>
                        <span className="font-medium">Training Data:</span> {predictionResult.model.trainingDataSize} records
                      </div>
                      <div>
                        <span className="font-medium">Features:</span> {predictionResult.model.features.length} parameters
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights */}
                {predictionResult.insights && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Historical Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Average Historical Yield:</span> {predictionResult.insights.avgHistoricalYield} kg/ha
                      </div>
                      <div>
                        <span className="font-medium">Best Year:</span> {predictionResult.insights.bestPerformingYear.year} ({predictionResult.insights.bestPerformingYear.yield} kg/ha)
                      </div>
                      <div>
                        <span className="font-medium">Yield Trend:</span> 
                        <Badge variant={predictionResult.insights.yieldTrend === 'increasing' ? 'default' : 'secondary'} className="ml-2">
                          {predictionResult.insights.yieldTrend}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Data Quality:</span> 
                        <Badge variant={predictionResult.insights.dataQuality === 'high' ? 'default' : 'secondary'} className="ml-2">
                          {predictionResult.insights.dataQuality}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">Prediction Failed</div>
                <div className="text-gray-600">{predictionResult.error}</div>
                {predictionResult.fallbackPrediction && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded">
                    <div className="font-medium">Fallback Prediction:</div>
                    <div>{predictionResult.fallbackPrediction.predictedYield} kg/ha ({predictionResult.fallbackPrediction.method})</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'recommendation' && recommendationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-green-500" />
              Crop Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendationResult.success && recommendationResult.recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendationResult.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold capitalize">{rec.crop}</h4>
                          <Badge className={getYieldColor(rec.yieldCategory)}>
                            {rec.yieldCategory}
                          </Badge>
                          <Badge variant="outline">
                            Score: {rec.suitabilityScore}/100
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Predicted Yield:</span><br />
                            {Math.round(rec.predictedYield)} kg/ha
                          </div>
                          <div>
                            <span className="font-medium">Confidence:</span><br />
                            {Math.round(rec.confidence * 100)}%
                          </div>
                          <div>
                            <span className="font-medium">Historical Avg:</span><br />
                            {Math.round(rec.historicalAvgYield)} kg/ha
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {recommendationResult.metadata && (
                  <div className="bg-green-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold mb-2">Analysis Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Algorithm:</span> {recommendationResult.metadata.algorithm}
                      </div>
                      <div>
                        <span className="font-medium">Crops Analyzed:</span> {recommendationResult.metadata.totalCropsAnalyzed}
                      </div>
                      <div>
                        <span className="font-medium">Region:</span> {recommendationResult.metadata.region}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">No Recommendations Available</div>
                <div className="text-gray-600">
                  {recommendationResult.error || 'Unable to generate crop recommendations for this region.'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}