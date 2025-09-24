import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { HelpCircle, TrendingDown, TrendingUp } from "lucide-react";

interface CropRecommendation {
  name: string;
  suitabilityScore: number;
  marketDemand: string;
  priceTrend: string;
  explanation: string;
  icon: string;
}

interface CropRecommendationCardProps {
  crop: CropRecommendation;
  index: number;
}

export default function CropRecommendationCard({ crop, index }: CropRecommendationCardProps) {
  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decreasing": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{crop.icon}</span>
              <CardTitle className="text-lg font-semibold text-gray-900">{crop.name}</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{crop.explanation}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Suitability Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Suitability Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${crop.suitabilityScore}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className={`h-2 rounded-full ${crop.suitabilityScore >= 80 ? 'bg-green-500' : crop.suitabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
              </div>
              <span className={`text-sm font-bold ${getScoreColor(crop.suitabilityScore)}`}>
                {crop.suitabilityScore}%
              </span>
            </div>
          </div>

          {/* Market Demand */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Market Demand</span>
            <Badge className={getDemandColor(crop.marketDemand)}>
              {crop.marketDemand}
            </Badge>
          </div>

          {/* Price Trend */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Price Trend</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(crop.priceTrend)}
              <span className="text-sm font-medium capitalize text-gray-700">
                {crop.priceTrend}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
