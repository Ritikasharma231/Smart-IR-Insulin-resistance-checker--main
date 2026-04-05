// API Service for connecting to FastAPI backend
import API_ENDPOINTS from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_ENDPOINTS.BACKEND.PREDICT;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Log more details for debugging
      if (error.message.includes('CORS')) {
        console.error('CORS Error: Backend may not be configured for CORS');
      }
      if (error.message.includes('Failed to fetch')) {
        console.error('Network Error: Backend server may not be running');
      }
      
      throw error;
    }
  }

  // Check backend health
  async checkHealth() {
    try {
      return this.request(API_ENDPOINTS.BACKEND.HEALTH);
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return { status: 'unavailable', message: 'Backend server is not running' };
    }
  }

  // Make prediction using FastAPI backend
  async predictInsulinResistance(patientData) {
    try {
      // Map frontend data to backend schema
      const backendData = this.mapToBackendSchema(patientData);
      
      return this.request(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
    } catch (error) {
      console.error('Prediction API Error:', error);
      
      // Return fallback prediction
      return this.getFallbackPrediction(patientData);
    }
  }

  // Fallback prediction when backend is unavailable
  getFallbackPrediction(data) {
    // Simple risk calculation based on BMI and age
    let riskScore = 30;
    
    if (parseFloat(data.age) > 45) riskScore += 10;
    if (parseFloat(data.age) > 60) riskScore += 10;
    
    const bmi = parseFloat(data.bmi);
    if (bmi > 25) riskScore += 15;
    if (bmi > 30) riskScore += 20;
    
    const waist = parseFloat(data.waistCircumference);
    if (data.sex === 'male' && waist > 102) riskScore += 15;
    if (data.sex === 'female' && waist > 88) riskScore += 15;
    
    riskScore = Math.min(100, Math.max(0, riskScore));
    
    let riskCategory = 'Low Risk';
    if (riskScore > 60) riskCategory = 'High Risk';
    else if (riskScore > 30) riskCategory = 'Moderate Risk';
    
    return {
      riskScore: riskScore,
      riskLevel: riskCategory,
      prediction: riskScore > 50 ? 1 : 0,
      label: riskScore > 50 ? 'Insulin Resistant' : 'Normal',
      topRiskFactors: [
        riskScore > 50 ? 'BMI increased risk' : 'BMI within healthy range',
        riskScore > 50 ? 'Age factor contributing' : 'Age not a major factor',
        riskScore > 50 ? 'Waist circumference elevated' : 'Waist circumference normal'
      ],
      explanation: `Based on your BMI (${bmi}) and age (${data.age}), your estimated insulin resistance risk is ${riskCategory}. This is a basic calculation and for accurate assessment, please consult with a healthcare provider.`,
      recommendations: this.generateRecommendations({ risk_category: riskCategory }),
      insights: this.generateInsights({ risk_category: riskCategory }),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      type: data.type,
      date: new Date().toISOString(),
      ...data,
      fallback: true
    };
  }

  // Map frontend assessment data to FastAPI backend schema
  mapToBackendSchema(data) {
    const baseSchema = {
      model_type: data.type.toLowerCase(), // "basic", "intermediate", "advanced"
      Age: parseFloat(data.age),
      Sex: data.sex === 'male' ? 1 : 0,
      BMI: parseFloat(data.bmi),
      Waist: parseFloat(data.waistCircumference),
    };

    // Add intermediate fields if available
    if (data.fastingGlucose !== undefined && data.triglycerides !== undefined) {
      baseSchema.Glucose = parseFloat(data.fastingGlucose);
      baseSchema.Triglycerides = parseFloat(data.triglycerides);
    }

    // Add advanced fields if available
    if (data.hdl !== undefined) {
      baseSchema.HDL = parseFloat(data.hdl);
    }
    
    if (data.exerciseFrequency !== undefined) {
      baseSchema.Exercise = parseFloat(data.exerciseFrequency);
    }

    return baseSchema;
  }

  // Map backend response to frontend format
  mapFromBackendResponse(backendResponse, originalData) {
    return {
      riskScore: backendResponse.risk_probability,
      riskLevel: backendResponse.risk_category,
      prediction: backendResponse.prediction,
      label: backendResponse.label,
      topRiskFactors: backendResponse.top_risk_factors,
      explanation: backendResponse.explanation,
      recommendations: this.generateRecommendations(backendResponse),
      insights: this.generateInsights(backendResponse),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months from now
      type: originalData.type,
      date: new Date().toISOString(),
      ...originalData
    };
  }

  // Generate recommendations based on backend response
  generateRecommendations(response) {
    const recommendations = [];
    
    if (response.risk_category === 'High Risk') {
      recommendations.push({
        category: 'Immediate Action Required',
        priority: 'high',
        items: [
          'Consult with a healthcare provider immediately',
          'Implement dietary changes focusing on low-glycemic foods',
          'Start a regular exercise routine',
          'Monitor blood glucose levels regularly'
        ]
      });
    } else if (response.risk_category === 'Moderate Risk') {
      recommendations.push({
        category: 'Lifestyle Modifications',
        priority: 'medium',
        items: [
          'Increase physical activity to at least 150 minutes per week',
          'Focus on weight management',
          'Reduce refined carbohydrate intake',
          'Schedule regular medical check-ups'
        ]
      });
    } else {
      recommendations.push({
        category: 'Maintenance',
        priority: 'low',
        items: [
          'Continue current healthy lifestyle',
          'Maintain regular exercise routine',
          'Schedule annual health screenings',
          'Monitor weight and waist circumference'
        ]
      });
    }

    // Add specific recommendations based on top risk factors
    if (response.top_risk_factors && response.top_risk_factors.length > 0) {
      const specificRecommendations = {
        category: 'Targeted Interventions',
        priority: 'medium',
        items: response.top_risk_factors.slice(0, 3).map(factor => 
          `Address ${factor.split(' ')[0].toLowerCase()} concerns through targeted lifestyle changes`
        )
      };
      recommendations.push(specificRecommendations);
    }

    return recommendations;
  }

  // Generate insights based on backend response
  generateInsights(response) {
    const insights = [];
    
    // Positive insights
    if (response.risk_category === 'Low Risk') {
      insights.push({
        type: 'positive',
        message: 'Your current health profile shows low risk for insulin resistance'
      });
    }

    // Risk factor insights
    if (response.top_risk_factors && response.top_risk_factors.length > 0) {
      const topFactor = response.top_risk_factors[0];
      if (topFactor.includes('decreased risk')) {
        insights.push({
          type: 'positive',
          message: `Your ${topFactor.split(' ')[0]} levels are positively contributing to your health`
        });
      } else {
        insights.push({
          type: 'warning',
          message: `Your ${topFactor.split(' ')[0]} levels need attention to reduce risk`
        });
      }
    }

    return insights;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
