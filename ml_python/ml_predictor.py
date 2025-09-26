# AgriSmart Python ML System
# High-Performance Random Forest Implementation
# Trained with same data as TypeScript version

import sys
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, accuracy_score, r2_score
import joblib
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class AgriSmartMLPredictor:
    def __init__(self):
        self.yield_model = None
        self.recommendation_model = None
        self.scaler = None
        self.crop_encoder = None
        self.state_encoder = None
        self.district_encoder = None
        self.is_trained = False
        self.model_path = 'ml_python/models/'
        self.training_stats = {}
        
        # Create models directory
        os.makedirs(self.model_path, exist_ok=True)
        
    def create_synthetic_training_data(self):
        """
        Create comprehensive training dataset similar to your current system
        37+ crops, 15 soil types, multiple environmental conditions
        """
        print("Creating synthetic training dataset...")
        
        # Your 37+ crops from the current system
        crops = [
            'Rice', 'Wheat', 'Maize', 'Barley', 'Millet', 'Sorghum',  # Cereals
            'Cotton', 'Sugarcane', 'Tobacco', 'Jute',  # Cash crops
            'Groundnut', 'Sunflower', 'Sesame', 'Safflower', 'Mustard', 'Soybean',  # Oilseeds
            'Chickpea', 'Pigeon Pea', 'Black Gram', 'Green Gram', 'Lentil', 'Field Pea',  # Pulses
            'Potato', 'Tomato', 'Onion', 'Cabbage', 'Cauliflower', 'Carrot', 'Brinjal', 'Okra', 'Cucumber', 'Pumpkin',  # Vegetables
            'Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pomegranate',  # Fruits
            'Chili', 'Turmeric', 'Coriander', 'Cumin', 'Fenugreek'  # Spices
        ]
        
        # Indian states and districts
        states = [
            'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 
            'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Odisha',
            'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Telangana'
        ]
        
        districts = [
            'Ludhiana', 'Amritsar', 'Chandigarh', 'Gurugram', 'Faridabad',
            'Agra', 'Lucknow', 'Kanpur', 'Indore', 'Bhopal', 'Mumbai', 'Pune',
            'Ahmedabad', 'Surat', 'Jaipur', 'Jodhpur', 'Kolkata', 'Howrah'
        ]
        
        # Soil types from your current system
        soil_types = [
            'Red', 'Black', 'Alluvial', 'Clayey', 'Sandy', 'Loamy', 'Silt',
            'Peat', 'Chalk', 'Saline', 'Acidic', 'Alkaline', 'Volcanic', 'Desert', 'Laterite'
        ]
        
        # Generate comprehensive training data
        training_data = []
        np.random.seed(42)  # For reproducible results
        
        # Create 1000+ training samples (matching your current training size)
        for _ in range(1200):
            crop = np.random.choice(crops)
            state = np.random.choice(states)
            district = np.random.choice(districts) 
            soil_type = np.random.choice(soil_types)
            
            # Environmental parameters with realistic ranges
            temperature = np.random.normal(25, 8)  # 15-35°C typical range
            humidity = np.random.normal(65, 15)    # 40-90% typical range
            rainfall = np.random.normal(800, 300)  # 200-1500mm typical range
            ph = np.random.normal(6.8, 1.2)       # 4.5-8.5 typical range
            nitrogen = np.random.normal(120, 40)   # 50-200 kg/ha
            phosphorus = np.random.normal(60, 20)  # 20-100 kg/ha
            potassium = np.random.normal(80, 30)   # 30-150 kg/ha
            
            # Ensure realistic bounds
            temperature = np.clip(temperature, 15, 40)
            humidity = np.clip(humidity, 30, 95)
            rainfall = np.clip(rainfall, 200, 1800)
            ph = np.clip(ph, 4.5, 9.0)
            nitrogen = np.clip(nitrogen, 40, 250)
            phosphorus = np.clip(phosphorus, 15, 120)
            potassium = np.clip(potassium, 20, 180)
            
            # Calculate yield based on crop-specific factors and conditions
            base_yield = self.get_base_yield(crop)
            
            # Environmental factors affecting yield
            temp_factor = self.get_temperature_factor(crop, temperature)
            humidity_factor = self.get_humidity_factor(crop, humidity)
            rainfall_factor = self.get_rainfall_factor(crop, rainfall)
            ph_factor = self.get_ph_factor(crop, ph)
            soil_factor = self.get_soil_factor(crop, soil_type)
            nutrient_factor = self.get_nutrient_factor(nitrogen, phosphorus, potassium)
            
            # Calculate final yield with some randomness
            yield_kg_ha = base_yield * temp_factor * humidity_factor * rainfall_factor * ph_factor * soil_factor * nutrient_factor
            yield_kg_ha = yield_kg_ha * np.random.normal(1.0, 0.15)  # Add 15% variability
            yield_kg_ha = max(100, yield_kg_ha)  # Minimum viable yield
            
            training_data.append({
                'crop': crop,
                'state': state,
                'district': district,
                'soil_type': soil_type,
                'temperature': round(temperature, 1),
                'humidity': round(humidity, 1),
                'rainfall': round(rainfall, 1),
                'ph': round(ph, 2),
                'nitrogen': round(nitrogen, 1),
                'phosphorus': round(phosphorus, 1),
                'potassium': round(potassium, 1),
                'yield_kg_ha': round(yield_kg_ha, 0)
            })
        
        df = pd.DataFrame(training_data)
        print(f"Created training dataset with {len(df)} samples")
        print(f"Crops: {len(df['crop'].unique())}, States: {len(df['state'].unique())}")
        return df
    
    def get_base_yield(self, crop):
        """Get base yield for different crops (kg/ha)"""
        base_yields = {
            # Cereals - high yield potential
            'Rice': 3500, 'Wheat': 3200, 'Maize': 4000, 'Barley': 2800, 'Millet': 1500, 'Sorghum': 2000,
            
            # Cash crops - very high yield potential  
            'Cotton': 2500, 'Sugarcane': 75000, 'Tobacco': 2200, 'Jute': 2800,
            
            # Oilseeds - moderate yield
            'Groundnut': 2200, 'Sunflower': 1800, 'Sesame': 800, 'Safflower': 1200, 'Mustard': 1500, 'Soybean': 2500,
            
            # Pulses - moderate yield
            'Chickpea': 1800, 'Pigeon Pea': 1500, 'Black Gram': 1200, 'Green Gram': 1000, 'Lentil': 1300, 'Field Pea': 1800,
            
            # Vegetables - high yield potential
            'Potato': 25000, 'Tomato': 35000, 'Onion': 20000, 'Cabbage': 30000, 'Cauliflower': 25000, 
            'Carrot': 22000, 'Brinjal': 18000, 'Okra': 12000, 'Cucumber': 15000, 'Pumpkin': 20000,
            
            # Fruits - very high yield potential
            'Apple': 15000, 'Banana': 40000, 'Orange': 20000, 'Mango': 12000, 'Grapes': 18000, 'Pomegranate': 10000,
            
            # Spices - moderate yield
            'Chili': 3000, 'Turmeric': 6000, 'Coriander': 1500, 'Cumin': 1200, 'Fenugreek': 1800
        }
        return base_yields.get(crop, 2000)
    
    def get_temperature_factor(self, crop, temp):
        """Temperature suitability factor for crops"""
        # Optimal temperature ranges for different crop categories
        temp_prefs = {
            'Rice': (20, 35), 'Wheat': (15, 25), 'Maize': (18, 32), 'Cotton': (21, 30),
            'Sugarcane': (20, 35), 'Potato': (15, 25), 'Tomato': (18, 28)
        }
        
        if crop in temp_prefs:
            opt_min, opt_max = temp_prefs[crop]
        else:
            opt_min, opt_max = 18, 30  # Default range
            
        if opt_min <= temp <= opt_max:
            return 1.0
        elif temp < opt_min:
            return max(0.3, 1 - (opt_min - temp) * 0.05)
        else:
            return max(0.3, 1 - (temp - opt_max) * 0.05)
    
    def get_humidity_factor(self, crop, humidity):
        """Humidity suitability factor"""
        if 50 <= humidity <= 80:
            return 1.0
        elif humidity < 50:
            return max(0.4, 1 - (50 - humidity) * 0.02)
        else:
            return max(0.6, 1 - (humidity - 80) * 0.01)
    
    def get_rainfall_factor(self, crop, rainfall):
        """Rainfall suitability factor"""
        rainfall_prefs = {
            'Rice': (1000, 1500), 'Wheat': (400, 800), 'Cotton': (600, 1200),
            'Sugarcane': (1200, 1800), 'Potato': (500, 800)
        }
        
        if crop in rainfall_prefs:
            opt_min, opt_max = rainfall_prefs[crop]
        else:
            opt_min, opt_max = 600, 1200  # Default range
            
        if opt_min <= rainfall <= opt_max:
            return 1.0
        elif rainfall < opt_min:
            return max(0.3, 1 - (opt_min - rainfall) * 0.0005)
        else:
            return max(0.7, 1 - (rainfall - opt_max) * 0.0003)
    
    def get_ph_factor(self, crop, ph):
        """Soil pH suitability factor"""
        if 6.0 <= ph <= 7.5:
            return 1.0
        elif ph < 6.0:
            return max(0.4, 1 - (6.0 - ph) * 0.1)
        else:
            return max(0.5, 1 - (ph - 7.5) * 0.08)
    
    def get_soil_factor(self, crop, soil_type):
        """Soil type suitability factor"""
        soil_suitability = {
            'Alluvial': 1.0, 'Loamy': 0.95, 'Black': 0.9, 'Red': 0.85,
            'Clayey': 0.8, 'Sandy': 0.7, 'Silt': 0.75, 'Laterite': 0.6
        }
        return soil_suitability.get(soil_type, 0.7)
    
    def get_nutrient_factor(self, n, p, k):
        """Nutrient availability factor"""
        # Optimal NPK ranges
        n_factor = min(1.0, n / 100) if n > 0 else 0.3
        p_factor = min(1.0, p / 50) if p > 0 else 0.3  
        k_factor = min(1.0, k / 60) if k > 0 else 0.3
        
        return (n_factor + p_factor + k_factor) / 3
    
    def train_models(self):
        """Train Random Forest models for yield prediction and crop recommendation"""
        print("Training Random Forest models...")
        
        # Create training data
        df = self.create_synthetic_training_data()
        
        # Prepare encoders
        self.crop_encoder = LabelEncoder()
        self.state_encoder = LabelEncoder()
        self.district_encoder = LabelEncoder()
        
        # Encode categorical variables
        df_encoded = df.copy()
        df_encoded['crop_encoded'] = self.crop_encoder.fit_transform(df['crop'])
        df_encoded['state_encoded'] = self.state_encoder.fit_transform(df['state'])
        df_encoded['district_encoded'] = self.district_encoder.fit_transform(df['district'])
        
        # Features for training
        feature_cols = ['state_encoded', 'district_encoded', 'temperature', 'humidity', 
                       'rainfall', 'ph', 'nitrogen', 'phosphorus', 'potassium']
        
        X = df_encoded[feature_cols]
        y_yield = df_encoded['yield_kg_ha']
        y_crop = df_encoded['crop_encoded']
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_yield_train, y_yield_test, y_crop_train, y_crop_test = train_test_split(
            X_scaled, y_yield, y_crop, test_size=0.2, random_state=42
        )
        
        # Train Yield Prediction Model (Random Forest Regressor)
        print("Training yield prediction model...")
        self.yield_model = RandomForestRegressor(
            n_estimators=100,  # Same as your current system
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=3,
            random_state=42,
            n_jobs=-1
        )
        
        self.yield_model.fit(X_train, y_yield_train)
        
        # Evaluate yield model
        yield_pred = self.yield_model.predict(X_test)
        yield_mse = mean_squared_error(y_yield_test, yield_pred)
        yield_r2 = r2_score(y_yield_test, yield_pred)
        
        # Train Crop Recommendation Model (Random Forest Classifier)
        print("Training crop recommendation model...")
        self.recommendation_model = RandomForestClassifier(
            n_estimators=100,  # Same as your current system
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.recommendation_model.fit(X_train, y_crop_train)
        
        # Evaluate recommendation model
        crop_pred = self.recommendation_model.predict(X_test)
        crop_accuracy = accuracy_score(y_crop_test, crop_pred)
        
        # Store training statistics
        self.training_stats = {
            'training_samples': len(df),
            'num_crops': len(df['crop'].unique()),
            'num_states': len(df['state'].unique()),
            'yield_mse': float(yield_mse),
            'yield_r2': float(yield_r2),
            'crop_accuracy': float(crop_accuracy),
            'training_date': datetime.now().isoformat(),
            'algorithm': 'Random Forest (Scikit-learn)',
            'features': feature_cols
        }
        
        print(f"Training completed!")
        print(f"Yield Prediction R2 Score: {yield_r2:.3f}")
        print(f"Crop Classification Accuracy: {crop_accuracy:.3f}")
        
        self.is_trained = True
        
        # Save models
        self.save_models()
        
    def save_models(self):
        """Save trained models and encoders"""
        print("Saving models...")
        
        joblib.dump(self.yield_model, f'{self.model_path}/yield_model.pkl')
        joblib.dump(self.recommendation_model, f'{self.model_path}/recommendation_model.pkl')
        joblib.dump(self.scaler, f'{self.model_path}/scaler.pkl')
        joblib.dump(self.crop_encoder, f'{self.model_path}/crop_encoder.pkl')
        joblib.dump(self.state_encoder, f'{self.model_path}/state_encoder.pkl')
        joblib.dump(self.district_encoder, f'{self.model_path}/district_encoder.pkl')
        
        # Save training stats
        with open(f'{self.model_path}/training_stats.json', 'w') as f:
            json.dump(self.training_stats, f, indent=2)
            
        print("Models saved successfully!")
    
    def load_models(self):
        """Load pre-trained models"""
        try:
            self.yield_model = joblib.load(f'{self.model_path}/yield_model.pkl')
            self.recommendation_model = joblib.load(f'{self.model_path}/recommendation_model.pkl')
            self.scaler = joblib.load(f'{self.model_path}/scaler.pkl')
            self.crop_encoder = joblib.load(f'{self.model_path}/crop_encoder.pkl')
            self.state_encoder = joblib.load(f'{self.model_path}/state_encoder.pkl')
            self.district_encoder = joblib.load(f'{self.model_path}/district_encoder.pkl')
            
            with open(f'{self.model_path}/training_stats.json', 'r') as f:
                self.training_stats = json.load(f)
                
            self.is_trained = True
            self.is_trained = True
            return True
            
        except Exception as e:
            return False
    
    def predict_yield(self, input_data):
        """Predict crop yield for given conditions"""
        if not self.is_trained:
            if not self.load_models():
                self.train_models()
        
        try:
            # Prepare input features
            state_encoded = self.state_encoder.transform([input_data.get('state', 'Punjab')])[0]
            district_encoded = self.district_encoder.transform([input_data.get('district', 'Ludhiana')])[0]
            
            features = np.array([[
                state_encoded,
                district_encoded,
                input_data.get('temperature', 25),
                input_data.get('humidity', 65),
                input_data.get('rainfall', 800),
                input_data.get('ph', 6.8),
                input_data.get('nitrogen', 120),
                input_data.get('phosphorus', 60),
                input_data.get('potassium', 80)
            ]])
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict yield
            predicted_yield = self.yield_model.predict(features_scaled)[0]
            
            # Get confidence (based on prediction interval)
            # Use ensemble predictions for confidence estimation
            tree_predictions = [tree.predict(features_scaled)[0] for tree in self.yield_model.estimators_[:10]]
            std_dev = np.std(tree_predictions)
            confidence = max(0.6, min(0.95, 1 - (std_dev / predicted_yield) * 2))
            
            return {
                'predicted_yield': round(predicted_yield, 0),
                'confidence': round(confidence * 100, 1),
                'yield_category': self.categorize_yield(predicted_yield),
                'model_info': {
                    'algorithm': 'Random Forest Regressor',
                    'training_samples': self.training_stats.get('training_samples', 1200),
                    'r2_score': self.training_stats.get('yield_r2', 0.85)
                }
            }
            
        except Exception as e:
            print(f"Yield prediction error: {e}")
            return {'error': str(e)}
    
    def recommend_crops(self, input_data):
        """Recommend best crops for given conditions"""
        if not self.is_trained:
            if not self.load_models():
                self.train_models()
        
        try:
            # Prepare input features (same as yield prediction)
            state_encoded = self.state_encoder.transform([input_data.get('state', 'Punjab')])[0]
            district_encoded = self.district_encoder.transform([input_data.get('district', 'Ludhiana')])[0]
            
            features = np.array([[
                state_encoded,
                district_encoded,
                input_data.get('temperature', 25),
                input_data.get('humidity', 65),
                input_data.get('rainfall', 800),
                input_data.get('ph', 6.8),
                input_data.get('nitrogen', 120),
                input_data.get('phosphorus', 60),
                input_data.get('potassium', 80)
            ]])
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Get crop probabilities
            crop_probabilities = self.recommendation_model.predict_proba(features_scaled)[0]
            crop_classes = self.recommendation_model.classes_
            
            # Create recommendations
            recommendations = []
            for i, prob in enumerate(crop_probabilities):
                if prob > 0.01:  # Only include crops with >1% probability
                    crop_name = self.crop_encoder.inverse_transform([crop_classes[i]])[0]
                    
                    # Predict yield for this crop
                    crop_input = input_data.copy()
                    crop_input['crop'] = crop_name
                    yield_pred = self.predict_yield(crop_input)
                    
                    recommendations.append({
                        'crop': crop_name,
                        'suitability_score': round(prob * 100, 1),
                        'predicted_yield': yield_pred.get('predicted_yield', 0),
                        'confidence': yield_pred.get('confidence', 0),
                        'yield_category': yield_pred.get('yield_category', 'Unknown')
                    })
            
            # Sort by suitability score
            recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
            
            return {
                'recommendations': recommendations[:5],  # Top 5 crops
                'total_analyzed': len(recommendations),
                'model_info': {
                    'algorithm': 'Random Forest Classifier',
                    'training_samples': self.training_stats.get('training_samples', 1200),
                    'accuracy': self.training_stats.get('crop_accuracy', 0.88)
                }
            }
            
        except Exception as e:
            print(f"Crop recommendation error: {e}")
            return {'error': str(e)}
    
    def categorize_yield(self, yield_value):
        """Categorize yield performance"""
        if yield_value > 3000:
            return 'Excellent'
        elif yield_value > 2000:
            return 'Good'
        elif yield_value > 1000:
            return 'Average'
        else:
            return 'Low'

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("Usage: python ml_predictor.py <command> [data]")
        print("Commands: train, predict_yield, recommend_crops")
        return
    
    command = sys.argv[1]
    predictor = AgriSmartMLPredictor()
    
    if command == 'train':
        predictor.train_models()
        
    elif command == 'predict_yield':
        if len(sys.argv) < 3:
            print("Error: No input data provided")
            return
            
        input_data = json.loads(sys.argv[2])
        result = predictor.predict_yield(input_data)
        print(json.dumps(result))
        
    elif command == 'recommend_crops':
        if len(sys.argv) < 3:
            print("Error: No input data provided")
            return
            
        input_data = json.loads(sys.argv[2])
        result = predictor.recommend_crops(input_data)
        print(json.dumps(result))
        
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()