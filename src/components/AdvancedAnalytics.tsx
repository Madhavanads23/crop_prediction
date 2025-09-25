import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface AdvancedAnalyticsProps {
  predictions: any[];
  location: string;
  weatherData?: any;
}

export function AdvancedAnalytics({ predictions, location, weatherData }: AdvancedAnalyticsProps) {
  // Mock data for charts (would come from API in real implementation)
  const yieldTrendData = [
    { month: 'Jan', rice: 3200, wheat: 3800, cotton: 520 },
    { month: 'Feb', rice: 3400, wheat: 3900, cotton: 540 },
    { month: 'Mar', rice: 3600, wheat: 4000, cotton: 560 },
    { month: 'Apr', rice: 3800, wheat: 3700, cotton: 580 },
    { month: 'May', rice: 4000, wheat: 3500, cotton: 600 },
    { month: 'Jun', rice: 4200, wheat: 3300, cotton: 620 }
  ];

  const profitabilityData = predictions.slice(0, 5).map(pred => ({
    name: pred.crop,
    profit: Math.round(pred.suitabilityScore * 100 + Math.random() * 1000),
    investment: Math.round(pred.suitabilityScore * 50 + Math.random() * 500)
  }));

  const riskAssessment = [
    { name: 'Low Risk', value: 35, color: '#10B981' },
    { name: 'Medium Risk', value: 45, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' }
  ];

  const seasonalData = [
    { season: 'Kharif', suitability: 85, crops: ['Rice', 'Cotton', 'Sugarcane'] },
    { season: 'Rabi', suitability: 78, crops: ['Wheat', 'Onion', 'Potato'] },
    { season: 'Zaid', suitability: 65, crops: ['Tomato', 'Groundnut'] }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-6"
    >
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            Advanced Agricultural Analytics
          </CardTitle>
          <CardDescription className="text-indigo-700">
            Comprehensive insights and predictive analysis for {location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trends">Yield Trends</TabsTrigger>
              <TabsTrigger value="profitability">Profitability</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">6-Month Yield Projection</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yieldTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rice" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="wheat" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="cotton" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Rice (kg/hectare)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Wheat (kg/hectare)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Cotton (kg/hectare)</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profitability" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Profit vs Investment Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="profit" fill="#10B981" name="Expected Profit (₹/hectare)" />
                      <Bar dataKey="investment" fill="#EF4444" name="Investment Required (₹/hectare)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Expected Profit (₹/hectare)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Investment Required (₹/hectare)</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskAssessment}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskAssessment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Risk Factors</h3>
                  {[
                    { factor: 'Weather Dependency', level: 75, color: 'bg-yellow-500' },
                    { factor: 'Market Volatility', level: 60, color: 'bg-orange-500' },
                    { factor: 'Pest & Disease', level: 45, color: 'bg-red-500' },
                    { factor: 'Water Availability', level: 30, color: 'bg-blue-500' }
                  ].map((risk, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{risk.factor}</span>
                        <span>{risk.level}%</span>
                      </div>
                      <Progress value={risk.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Seasonal Planting Guide</h3>
                {seasonalData.map((season, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-green-600" />
                            <div>
                              <h4 className="font-semibold text-lg">{season.season} Season</h4>
                              <p className="text-sm text-gray-600">
                                Suitability Score: {season.suitability}%
                              </p>
                            </div>
                          </div>
                          <Badge variant={season.suitability > 80 ? "default" : "secondary"}>
                            {season.suitability > 80 ? "Highly Suitable" : "Moderately Suitable"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {season.crops.map((crop, cropIdx) => (
                            <Badge key={cropIdx} variant="outline" className="bg-green-50">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                        <Progress value={season.suitability} className="mt-4 h-2" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}