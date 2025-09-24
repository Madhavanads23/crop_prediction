import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InputFormProps {
  onSubmit: (data: { region: string; soilType: string }) => void;
  isLoading: boolean;
}

const SOIL_TYPES = [
  { value: "clay", label: "Clay - Heavy, water-retaining soil" },
  { value: "loam", label: "Loam - Balanced, fertile soil" },
  { value: "sandy", label: "Sandy - Light, well-draining soil" },
  { value: "silt", label: "Silt - Fine particles, good nutrients" },
  { value: "peat", label: "Peat - Organic, acidic soil" },
  { value: "laterite", label: "Laterite - Iron-rich, tropical soil" },
];

const INDIAN_STATES: Array<string> = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [region, setRegion] = useState("");
  const [soilType, setSoilType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enforce India-only locations
    const regionLower = region.toLowerCase();
    const isIndiaMentioned = regionLower.includes("india");
    const matchesIndianState = INDIAN_STATES.some((s) =>
      regionLower.includes(s.toLowerCase())
    );

    if (!isIndiaMentioned && !matchesIndianState) {
      toast.error("AgriSmart Advisor currently supports India only. Please enter an Indian location.");
      return;
    }

    if (region && soilType) {
      onSubmit({ region, soilType });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-gray-100 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Get Your Crop Recommendations
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Enter your location and soil type to receive personalized agricultural advice
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Region Input */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                Region / Location in India
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="region"
                  type="text"
                  placeholder="e.g., Punjab, India or Chennai, Tamil Nadu"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Soil Type Select */}
            <div className="space-y-2">
              <Label htmlFor="soilType" className="text-sm font-medium text-gray-700">
                Soil Type
              </Label>
              <Select value={soilType} onValueChange={setSoilType} required>
                <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select your soil type" />
                </SelectTrigger>
                <SelectContent>
                  {SOIL_TYPES.map((soil) => (
                    <SelectItem key={soil.value} value={soil.value}>
                      {soil.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
              disabled={isLoading || !region || !soilType}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}