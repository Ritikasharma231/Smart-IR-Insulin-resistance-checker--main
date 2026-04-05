import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const IntermediateAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    type: 'Intermediate',
    age: '',
    sex: '',
    weight: '',
    height: '',
    waistCircumference: '',
    bmi: '',
    fastingGlucose: '',
    triglycerides: ''
  });
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState('');

  const steps = [
    { title: 'Basic Information', description: 'Age, sex, weight, height, and waist' },
    { title: 'Blood Glucose', description: 'Fasting blood glucose level' },
    { title: 'Triglycerides', description: 'Blood triglyceride level' }
  ];

  useEffect(() => {
    // Calculate BMI when weight and height are available
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height) / 100; // Convert cm to meters
      const bmi = (weight / (height * height)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  }, [formData.weight, formData.height]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.age) {
          newErrors.age = 'Age is required';
        } else if (formData.age < 18 || formData.age > 120) {
          newErrors.age = 'Age must be between 18 and 120';
        }
        if (!formData.sex) {
          newErrors.sex = 'Sex is required';
        }
        if (!formData.weight) {
          newErrors.weight = 'Weight is required';
        } else if (formData.weight < 30 || formData.weight > 300) {
          newErrors.weight = 'Weight must be between 30 and 300 kg';
        }
        if (!formData.height) {
          newErrors.height = 'Height is required';
        } else if (formData.height < 100 || formData.height > 250) {
          newErrors.height = 'Height must be between 100 and 250 cm';
        }
        if (!formData.waistCircumference) {
          newErrors.waistCircumference = 'Waist circumference is required';
        } else if (formData.waistCircumference < 50 || formData.waistCircumference > 200) {
          newErrors.waistCircumference = 'Waist circumference must be between 50 and 200 cm';
        }
        break;
      case 1: // Fasting Glucose
        if (!formData.fastingGlucose) {
          newErrors.fastingGlucose = 'Fasting glucose is required';
        } else if (formData.fastingGlucose < 50 || formData.fastingGlucose > 400) {
          newErrors.fastingGlucose = 'Fasting glucose must be between 50 and 400 mg/dL';
        }
        break;
      case 2: // Triglycerides
        if (!formData.triglycerides) {
          newErrors.triglycerides = 'Triglycerides is required';
        } else if (formData.triglycerides < 20 || formData.triglycerides > 1000) {
          newErrors.triglycerides = 'Triglycerides must be between 20 and 1000 mg/dL';
        }
        break;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNext = () => {
    const newErrors = validateStep(currentStep);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsCalculating(true);
    setApiError('');

    try {
      // Call FastAPI backend
      const backendResponse = await apiService.predictInsulinResistance(formData);
      
      // Map response to frontend format
      const result = apiService.mapFromBackendResponse(backendResponse, formData);
      
      // Save to localStorage
      const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      const newAssessment = {
        ...result,
        id: Date.now()
      };
      existingAssessments.unshift(newAssessment);
      localStorage.setItem('assessments', JSON.stringify(existingAssessments));
      
      // Navigate to results page
      navigate('/results', { state: { assessment: newAssessment } });
    } catch (error) {
      console.error('API Error:', error);
      setApiError('Failed to connect to the AI service. Please try again later.');
      
      // Fallback to local calculation if API fails
      handleFallbackCalculation();
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFallbackCalculation = () => {
    // Enhanced fallback calculation for intermediate assessment
    let riskScore = 25;
    
    if (formData.age > 45) riskScore += 8;
    if (formData.age > 60) riskScore += 8;
    
    const bmi = parseFloat(formData.bmi);
    if (bmi > 25) riskScore += 12;
    if (bmi > 30) riskScore += 12;
    
    const waist = parseFloat(formData.waistCircumference);
    if (formData.sex === 'male' && waist > 102) riskScore += 8;
    if (formData.sex === 'female' && waist > 88) riskScore += 8;
    
    const glucose = parseFloat(formData.fastingGlucose);
    if (glucose > 100) riskScore += 10;
    if (glucose > 126) riskScore += 15;
    
    const triglycerides = parseFloat(formData.triglycerides);
    if (triglycerides > 150) riskScore += 10;
    if (triglycerides > 200) riskScore += 10;
    
    riskScore = Math.min(100, Math.max(0, riskScore));
    
    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High';
    
    const fallbackResult = {
      riskScore,
      riskLevel,
      prediction: riskLevel === 'High' ? 1 : 0,
      label: riskLevel === 'High' ? 'Insulin Resistant' : 'Normal',
      topRiskFactors: [],
      explanation: 'This is a fallback calculation using intermediate metrics. The AI service was unavailable.',
      recommendations: [
        {
          category: 'Blood Sugar Management',
          priority: riskLevel === 'High' ? 'high' : 'medium',
          items: [
            'Monitor blood glucose regularly',
            'Reduce refined carbohydrate intake',
            'Consider consulting with a healthcare provider'
          ]
        },
        {
          category: 'Lifestyle Changes',
          priority: 'medium',
          items: [
            'Increase physical activity',
            'Maintain healthy weight',
            'Eat a balanced diet rich in fiber'
          ]
        }
      ],
      insights: [
        {
          type: 'info',
          message: 'This assessment included blood markers for more accurate risk evaluation'
        }
      ],
      nextAssessmentDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      ...formData,
      id: Date.now()
    };
    
    // Save to localStorage
    const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    existingAssessments.unshift(fallbackResult);
    localStorage.setItem('assessments', JSON.stringify(existingAssessments));
    
    navigate('/results', { state: { assessment: fallbackResult } });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your age"
                  min="18"
                  max="120"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['male', 'female'].map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sex }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.sex === sex
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="capitalize font-medium">{sex}</span>
                    </button>
                  ))}
                </div>
                {errors.sex && (
                  <p className="mt-1 text-sm text-red-600">{errors.sex}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Weight in kg"
                  min="30"
                  max="300"
                  step="0.1"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Height in cm"
                  min="100"
                  max="250"
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waist Circumference (cm)
              </label>
              <input
                type="number"
                name="waistCircumference"
                value={formData.waistCircumference}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Measure at navel level"
                min="50"
                max="200"
              />
              {errors.waistCircumference && (
                <p className="mt-1 text-sm text-red-600">{errors.waistCircumference}</p>
              )}
            </div>
            
            {formData.bmi && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">Calculated BMI:</span> {formData.bmi}
                </p>
              </div>
            )}
          </div>
        );

      case 1: // Fasting Glucose
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fasting Blood Glucose (mg/dL)
              </label>
              <input
                type="number"
                name="fastingGlucose"
                value={formData.fastingGlucose}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter fasting glucose level"
                min="50"
                max="400"
              />
              {errors.fastingGlucose && (
                <p className="mt-1 text-sm text-red-600">{errors.fastingGlucose}</p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Reference ranges:</p>
                <p>• Normal: Less than 100 mg/dL</p>
                <p>• Prediabetes: 100-125 mg/dL</p>
                <p>• Diabetes: 126 mg/dL or higher</p>
              </div>
            </div>
          </div>
        );

      case 2: // Triglycerides
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Triglycerides (mg/dL)
              </label>
              <input
                type="number"
                name="triglycerides"
                value={formData.triglycerides}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter triglyceride level"
                min="20"
                max="1000"
              />
              {errors.triglycerides && (
                <p className="mt-1 text-sm text-red-600">{errors.triglycerides}</p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Reference ranges:</p>
                <p>• Normal: Less than 150 mg/dL</p>
                <p>• Borderline high: 150-199 mg/dL</p>
                <p>• High: 200 mg/dL or higher</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Intermediate Assessment
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis with blood markers (10 minutes)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-morphism rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {renderStepContent()}

          {/* API Error */}
          {apiError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={isCalculating}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Get Results
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IntermediateAssessment;
