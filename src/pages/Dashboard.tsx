import CropRecommendationCard from "@/components/CropRecommendationCard";
import InputForm from "@/components/InputForm";
import WeatherChart from "@/components/WeatherChart";
import { MLPredictionCard } from "@/components/MLPredictionCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAction, useMutation, useQuery } from "convex/react";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  forecast: Array<{
    date: string;
    temp: number;
    rainfall: number;
  }>;
}

interface CropRecommendation {
  name: string;
  suitabilityScore: number;
  marketDemand: string;
  priceTrend: string;
  explanation: string;
  icon: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [inputData, setInputData] = useState<{ region: string; soilType: string } | null>(null);

  const getWeatherData = useAction(api.weather.getWeatherData);
  const getMarketData = useAction(api.market.getMarketData);
  const generateRecommendations = useMutation(api.recommendations.generateRecommendations);
  const userRecommendations = useQuery(api.recommendations.getUserRecommendations, {
    userId: user?._id,
    sessionId: user ? undefined : sessionId,
  });

  useEffect(() => {
    if (userRecommendations && userRecommendations.length > 0) {
      const latest = userRecommendations[0];
      setRecommendations(latest.crops);
      setWeatherData(latest.weatherData);
      setInputData({ region: latest.region, soilType: latest.soilType });
    }
  }, [userRecommendations]);

  const handleFormSubmit = async (data: { region: string; soilType: string }) => {
    setIsLoading(true);
    try {
      toast("Fetching weather and market data...");
      
      // Get weather data
      const weather = await getWeatherData({ region: data.region });
      setWeatherData(weather);
      
      // Get market data for common crops
      const crops = ["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugarcane", "Tomatoes", "Potatoes", "Onions", "Carrots"];
      const market = await getMarketData({ crops, region: data.region });
      
      // Generate recommendations
      const result = await generateRecommendations({
        userId: user?._id,
        region: data.region,
        soilType: data.soilType as any,
        weatherData: weather,
        marketData: market,
        sessionId: user ? undefined : sessionId,
      });
      
      setRecommendations(result.crops);
      setInputData(data);
      toast.success("Recommendations generated successfully!");
      
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    toast("PDF download feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">AgriSmart Advisor</h1>
              </div>
            </div>
            
            {recommendations.length > 0 && (
              <Button
                onClick={handleDownloadReport}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {recommendations.length === 0 ? (
          /* Input Form */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Smart Agricultural Recommendations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Get personalized crop recommendations based on your soil type, local weather conditions, and market demand data.
              </p>
            </motion.div>
            
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Crop Recommendations for {inputData?.region}
              </h2>
              <p className="text-gray-600">
                Based on {inputData?.soilType} soil type and current market conditions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Weather Chart */}
              <div className="lg:col-span-1">
                {weatherData && <WeatherChart weatherData={weatherData} />}
              </div>

              {/* Crop Recommendations */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((crop, index) => (
                    <CropRecommendationCard
                      key={crop.name}
                      crop={crop}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* New Analysis Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-8"
            >
              <Button
                onClick={() => {
                  setRecommendations([]);
                  setWeatherData(null);
                  setInputData(null);
                }}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                New Analysis
              </Button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
