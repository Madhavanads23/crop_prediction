import { motion } from "framer-motion";
import { Cloud, Droplets, Thermometer } from "lucide-react";

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

interface WeatherChartProps {
  weatherData: WeatherData;
}

export default function WeatherChart({ weatherData }: WeatherChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Weather Overview</h3>
      
      {/* Current Weather Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <Thermometer className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{weatherData.temperature}°C</div>
          <div className="text-sm text-blue-700">Temperature</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <Droplets className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">{weatherData.humidity}%</div>
          <div className="text-sm text-green-700">Humidity</div>
        </div>
        
        <div className="text-center p-4 bg-indigo-50 rounded-xl">
          <Cloud className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-indigo-900">{weatherData.rainfall}mm</div>
          <div className="text-sm text-indigo-700">Rainfall</div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-4">7-Day Forecast</h4>
        <div className="space-y-2">
          {weatherData.forecast.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-700">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Thermometer className="h-4 w-4" />
                  {day.temp}°C
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Droplets className="h-4 w-4" />
                  {day.rainfall}mm
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
