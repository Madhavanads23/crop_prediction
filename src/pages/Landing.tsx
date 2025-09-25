import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-simple";
import SimpleNavigation from "@/components/SimpleNavigation";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Cloud, Leaf, MapPin, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Location-Based Analysis",
      description: "Get recommendations tailored to your specific region and local conditions."
    },
    {
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      title: "Weather Integration", 
      description: "Real-time weather data and forecasts to optimize your crop selection."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Market Intelligence",
      description: "Current market demand and price trends to maximize your profits."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Smart Recommendations",
      description: "AI-powered crop suggestions based on soil, weather, and market data."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">AgriSmart Advisor</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {!isLoading && (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Smart Crop
                <span className="text-green-600"> Recommendations</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Make informed agricultural decisions with AI-powered crop recommendations based on your soil type, local weather conditions, and real-time market data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-medium"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  // Scroll to features section for "Learn More"
                  const featuresSection = document.getElementById('features-section');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-16 relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl">🌾</div>
                  <div className="text-sm font-medium text-gray-700">Crop Analysis</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">🌤️</div>
                  <div className="text-sm font-medium text-gray-700">Weather Data</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">📊</div>
                  <div className="text-sm font-medium text-gray-700">Market Trends</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">🎯</div>
                  <div className="text-sm font-medium text-gray-700">Smart Insights</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smart Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines multiple data sources to give you the most accurate crop recommendations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get personalized recommendations in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Details",
                description: "Provide your location and soil type information"
              },
              {
                step: "02", 
                title: "Data Analysis",
                description: "We analyze weather patterns and market conditions"
              },
              {
                step: "03",
                title: "Get Recommendations",
                description: "Receive ranked crop suggestions with detailed insights"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Optimize Your Farming?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of farmers making smarter crop decisions with AgriSmart Advisor.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
            >
              Start Your Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-green-400" />
              <span className="text-lg font-semibold">AgriSmart Advisor</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 AgriSmart Advisor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}