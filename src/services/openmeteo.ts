// OpenMeteo API Integration Service
// Free weather API with comprehensive data

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  weatherCode: number;
  weatherDescription: string;
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    average: number;
  };
  rainfall: number;
  humidity: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface AgriculturalWeatherData {
  current: WeatherData;
  forecast: WeatherForecast[];
  soilTemperature: number;
  soilMoisture: number;
  evapotranspiration: number;
  growingDegreeDays: number;
  recommendations: string[];
}

class OpenMeteoService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  // District coordinates mapping for major Indian districts
  private districtCoordinates: Record<string, { lat: number; lon: number }> = {
    // Major cities/districts coordinates
    'Mumbai': { lat: 19.0760, lon: 72.8777 },
    'Delhi': { lat: 28.7041, lon: 77.1025 },
    'Bengaluru': { lat: 12.9716, lon: 77.5946 },
    'Hyderabad': { lat: 17.3850, lon: 78.4867 },
    'Chennai': { lat: 13.0827, lon: 80.2707 },
    'Kolkata': { lat: 22.5726, lon: 88.3639 },
    'Pune': { lat: 18.5204, lon: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
    'Jaipur': { lat: 26.9124, lon: 75.7873 },
    'Lucknow': { lat: 26.8467, lon: 80.9462 },
    'Kanpur': { lat: 26.4499, lon: 80.3319 },
    'Nagpur': { lat: 21.1458, lon: 79.0882 },
    'Indore': { lat: 22.7196, lon: 75.8577 },
    'Thane': { lat: 19.2183, lon: 72.9781 },
    'Bhopal': { lat: 23.2599, lon: 77.4126 },
    'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'Pimpri-Chinchwad': { lat: 18.6298, lon: 73.7997 },
    'Patna': { lat: 25.5941, lon: 85.1376 },
    'Vadodara': { lat: 22.3072, lon: 73.1812 },
    'Ghaziabad': { lat: 28.6692, lon: 77.4538 },
    'Ludhiana': { lat: 30.9010, lon: 75.8573 },
    'Agra': { lat: 27.1767, lon: 78.0081 },
    'Nashik': { lat: 19.9975, lon: 73.7898 },
    'Faridabad': { lat: 28.4089, lon: 77.3178 },
    'Meerut': { lat: 28.9845, lon: 77.7064 },
    'Rajkot': { lat: 22.3039, lon: 70.8022 },
    'Kalyan-Dombivali': { lat: 19.2403, lon: 73.1305 },
    'Vasai-Virar': { lat: 19.4911, lon: 72.8054 },
    'Varanasi': { lat: 25.3176, lon: 82.9739 },
    'Srinagar': { lat: 34.0837, lon: 74.7973 }
  };

  async getCoordinates(district: string, state: string): Promise<{ lat: number; lon: number }> {
    // Check if we have coordinates for this district
    if (this.districtCoordinates[district]) {
      return this.districtCoordinates[district];
    }

    try {
      // Use geocoding API to get coordinates
      const query = `${district}, ${state}, India`;
      const response = await fetch(
        `${this.geocodingUrl}/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.latitude,
          lon: result.longitude
        };
      }
      
      throw new Error('Coordinates not found');
    } catch (error) {
      console.error('Error getting coordinates:', error);
      // Return approximate coordinates for the state capital as fallback
      return this.getStateCapitalCoordinates(state);
    }
  }

  async getCurrentWeather(
    district: string, 
    state: string
  ): Promise<WeatherData> {
    try {
      const coordinates = await this.getCoordinates(district, state);
      
      const params = new URLSearchParams({
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation',
          'wind_speed_10m',
          'wind_direction_10m',
          'surface_pressure',
          'uv_index',
          'visibility',
          'weather_code'
        ].join(','),
        timezone: 'Asia/Kolkata'
      });

      const response = await fetch(`${this.baseUrl}/forecast?${params}`);
      
      if (!response.ok) {
        throw new Error(`OpenMeteo API error: ${response.status}`);
      }

      const data = await response.json();
      const current = data.current;

      return {
        temperature: current.temperature_2m || 25,
        humidity: current.relative_humidity_2m || 60,
        rainfall: current.precipitation || 0,
        windSpeed: current.wind_speed_10m || 5,
        windDirection: current.wind_direction_10m || 180,
        pressure: current.surface_pressure || 1013,
        uvIndex: current.uv_index || 5,
        visibility: current.visibility || 10000,
        weatherCode: current.weather_code || 0,
        weatherDescription: this.getWeatherDescription(current.weather_code || 0),
        timestamp: current.time || new Date().toISOString(),
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lon
        }
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return this.getMockWeatherData(district, state);
    }
  }

  async getWeatherForecast(
    district: string, 
    state: string, 
    days: number = 7
  ): Promise<WeatherForecast[]> {
    try {
      const coordinates = await this.getCoordinates(district, state);
      
      const params = new URLSearchParams({
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lon.toString(),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'relative_humidity_2m_mean',
          'weather_code'
        ].join(','),
        timezone: 'Asia/Kolkata',
        forecast_days: days.toString()
      });

      const response = await fetch(`${this.baseUrl}/forecast?${params}`);
      
      if (!response.ok) {
        throw new Error(`OpenMeteo API error: ${response.status}`);
      }

      const data = await response.json();
      const daily = data.daily;

      const forecast: WeatherForecast[] = [];
      
      for (let i = 0; i < days && i < daily.time.length; i++) {
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        
        forecast.push({
          date: daily.time[i],
          temperature: {
            min: minTemp,
            max: maxTemp,
            average: (maxTemp + minTemp) / 2
          },
          rainfall: daily.precipitation_sum[i] || 0,
          humidity: daily.relative_humidity_2m_mean[i] || 60,
          weatherCode: daily.weather_code[i] || 0,
          weatherDescription: this.getWeatherDescription(daily.weather_code[i] || 0)
        });
      }

      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getMockForecastData(days);
    }
  }

  async getAgriculturalWeatherData(
    district: string, 
    state: string
  ): Promise<AgriculturalWeatherData> {
    try {
      const coordinates = await this.getCoordinates(district, state);
      
      const params = new URLSearchParams({
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation',
          'weather_code'
        ].join(','),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'relative_humidity_2m_mean',
          'weather_code',
          'soil_temperature_0cm',
          'soil_moisture_0_1cm',
          'et0_fao_evapotranspiration'
        ].join(','),
        timezone: 'Asia/Kolkata',
        forecast_days: '7'
      });

      const response = await fetch(`${this.baseUrl}/forecast?${params}`);
      
      if (!response.ok) {
        throw new Error(`OpenMeteo API error: ${response.status}`);
      }

      const data = await response.json();
      
      const current = await this.getCurrentWeather(district, state);
      const forecast = await this.getWeatherForecast(district, state, 7);
      
      // Calculate agricultural metrics
      const soilTemperature = data.daily?.soil_temperature_0cm?.[0] || current.temperature - 2;
      const soilMoisture = data.daily?.soil_moisture_0_1cm?.[0] || 0.3;
      const evapotranspiration = data.daily?.et0_fao_evapotranspiration?.[0] || 4.5;
      const growingDegreeDays = this.calculateGrowingDegreeDays(forecast);
      
      return {
        current,
        forecast,
        soilTemperature,
        soilMoisture,
        evapotranspiration,
        growingDegreeDays,
        recommendations: this.generateWeatherRecommendations(current, forecast)
      };
    } catch (error) {
      console.error('Error fetching agricultural weather data:', error);
      
      const current = await this.getCurrentWeather(district, state);
      const forecast = await this.getWeatherForecast(district, state, 7);
      
      return {
        current,
        forecast,
        soilTemperature: current.temperature - 2,
        soilMoisture: 0.3,
        evapotranspiration: 4.5,
        growingDegreeDays: this.calculateGrowingDegreeDays(forecast),
        recommendations: this.generateWeatherRecommendations(current, forecast)
      };
    }
  }

  private calculateGrowingDegreeDays(forecast: WeatherForecast[]): number {
    // Calculate cumulative growing degree days (base temperature 10°C)
    const baseTemp = 10;
    return forecast.reduce((total, day) => {
      const avgTemp = day.temperature.average;
      const gdd = Math.max(0, avgTemp - baseTemp);
      return total + gdd;
    }, 0);
  }

  private generateWeatherRecommendations(
    current: WeatherData, 
    forecast: WeatherForecast[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push('High temperature detected. Increase irrigation frequency and provide shade to crops.');
    } else if (current.temperature < 15) {
      recommendations.push('Low temperature detected. Consider protective measures for cold-sensitive crops.');
    }
    
    // Humidity-based recommendations
    if (current.humidity > 80) {
      recommendations.push('High humidity may increase disease risk. Ensure proper ventilation and consider fungicide application.');
    } else if (current.humidity < 40) {
      recommendations.push('Low humidity detected. Monitor crop water stress and adjust irrigation accordingly.');
    }
    
    // Rainfall-based recommendations
    const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall, 0);
    if (totalRainfall > 50) {
      recommendations.push('Heavy rainfall expected. Ensure proper drainage and delay fertilizer application.');
    } else if (totalRainfall < 5) {
      recommendations.push('Low rainfall expected. Plan for supplementary irrigation.');
    }
    
    // UV Index recommendations
    if (current.uvIndex > 8) {
      recommendations.push('High UV index. Provide shade protection for sensitive crops and workers.');
    }
    
    return recommendations;
  }

  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    
    return descriptions[code] || 'Unknown';
  }

  private getStateCapitalCoordinates(state: string): { lat: number; lon: number } {
    const stateCapitals: Record<string, { lat: number; lon: number }> = {
      'Andhra Pradesh': { lat: 17.3850, lon: 78.4867 }, // Hyderabad
      'Tamil Nadu': { lat: 13.0827, lon: 80.2707 }, // Chennai
      'Karnataka': { lat: 12.9716, lon: 77.5946 }, // Bengaluru
      'Kerala': { lat: 8.5241, lon: 76.9366 }, // Thiruvananthapuram
      'Maharashtra': { lat: 19.0760, lon: 72.8777 }, // Mumbai
      'Gujarat': { lat: 23.0225, lon: 72.5714 }, // Ahmedabad
      'Rajasthan': { lat: 26.9124, lon: 75.7873 }, // Jaipur
      'Punjab': { lat: 30.7333, lon: 76.7794 }, // Chandigarh
      'Haryana': { lat: 30.7333, lon: 76.7794 }, // Chandigarh
      'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 }, // Lucknow
      'Bihar': { lat: 25.5941, lon: 85.1376 }, // Patna
      'West Bengal': { lat: 22.5726, lon: 88.3639 }, // Kolkata
      'Odisha': { lat: 20.9517, lon: 85.0985 }, // Bhubaneswar
      'Madhya Pradesh': { lat: 23.2599, lon: 77.4126 }, // Bhopal
      'Telangana': { lat: 17.3850, lon: 78.4867 }, // Hyderabad
      'Chhattisgarh': { lat: 21.2787, lon: 81.8661 }, // Raipur
      'Jharkhand': { lat: 23.6102, lon: 85.2799 }, // Ranchi
      'Assam': { lat: 26.1445, lon: 91.7362 }, // Guwahati
      'Arunachal Pradesh': { lat: 27.1021, lon: 93.6919 }, // Itanagar
      'Meghalaya': { lat: 25.4670, lon: 91.3662 }, // Shillong
      'Manipur': { lat: 24.6637, lon: 93.9063 }, // Imphal
      'Mizoram': { lat: 23.1645, lon: 92.9376 }, // Aizawl
      'Nagaland': { lat: 25.6751, lon: 94.1086 }, // Kohima
      'Tripura': { lat: 23.9408, lon: 91.9882 }, // Agartala
      'Sikkim': { lat: 27.5330, lon: 88.5122 }, // Gangtok
      'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 }, // Shimla
      'Uttarakhand': { lat: 30.0668, lon: 79.0193 }, // Dehradun
      'Goa': { lat: 15.2993, lon: 74.1240 } // Panaji
    };

    return stateCapitals[state] || { lat: 20.5937, lon: 78.9629 }; // Center of India
  }

  private getMockWeatherData(district: string, state: string): WeatherData {
    const coordinates = this.getStateCapitalCoordinates(state);
    
    return {
      temperature: 25 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      rainfall: Math.random() * 10,
      windSpeed: 5 + Math.random() * 10,
      windDirection: Math.random() * 360,
      pressure: 1010 + Math.random() * 10,
      uvIndex: 3 + Math.random() * 5,
      visibility: 8000 + Math.random() * 2000,
      weatherCode: Math.floor(Math.random() * 4),
      weatherDescription: ['Clear sky', 'Partly cloudy', 'Overcast', 'Light rain'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString(),
      coordinates: {
        latitude: coordinates.lat,
        longitude: coordinates.lon
      }
    };
  }

  private getMockForecastData(days: number): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const maxTemp = 25 + Math.random() * 10;
      const minTemp = maxTemp - 5 - Math.random() * 5;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: minTemp,
          max: maxTemp,
          average: (maxTemp + minTemp) / 2
        },
        rainfall: Math.random() * 15,
        humidity: 50 + Math.random() * 30,
        weatherCode: Math.floor(Math.random() * 4),
        weatherDescription: ['Clear sky', 'Partly cloudy', 'Overcast', 'Light rain'][Math.floor(Math.random() * 4)]
      });
    }
    
    return forecast;
  }
}

export const openMeteoService = new OpenMeteoService();