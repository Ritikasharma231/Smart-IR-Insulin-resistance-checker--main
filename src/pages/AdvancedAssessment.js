import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const AdvancedAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    type: 'Advanced',
    age: '',
    sex: '',
    weight: '',
    height: '',
    waistCircumference: '',
    bmi: '',
    fastingGlucose: '',
    triglycerides: '',
    hdl: '',
    systolicBP: '',
    diastolicBP: '',
    exerciseFrequency: '',
    exerciseIntensity: '',
    exerciseDuration: ''
  });
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState('');

  const steps = [
    { title: 'Basic Information', description: 'Age, sex, weight, height, and waist' },
    { title: 'Blood Markers', description: 'Glucose, triglycerides, and HDL cholesterol' },
    { title: 'Blood Pressure', description: 'Systolic and diastolic measurements' },
    { title: 'Exercise Habits', description: 'Frequency, intensity, and duration' }
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
      case 1: // Blood Markers
        if (!formData.fastingGlucose) {
          newErrors.fastingGlucose = 'Fasting glucose is required';
        } else if (formData.fastingGlucose < 50 || formData.fastingGlucose > 400) {
          newErrors.fastingGlucose = 'Fasting glucose must be between 50 and 400 mg/dL';
        }
        if (!formData.triglycerides) {
          newErrors.triglycerides = 'Triglycerides is required';
        } else if (formData.triglycerides < 20 || formData.triglycerides > 1000) {
          newErrors.triglycerides = 'Triglycerides must be between 20 and 1000 mg/dL';
        }
        if (!formData.hdl) {
          newErrors.hdl = 'HDL cholesterol is required';
        } else if (formData.hdl < 20 || formData.hdl > 100) {
          newErrors.hdl = 'HDL must be between 20 and 100 mg/dL';
        }
        break;
      case 2: // Blood Pressure
        if (!formData.systolicBP) {
          newErrors.systolicBP = 'Systolic blood pressure is required';
        } else if (formData.systolicBP < 70 || formData.systolicBP > 250) {
          newErrors.systolicBP = 'Systolic BP must be between 70 and 250 mmHg';
        }
        if (!formData.diastolicBP) {
          newErrors.diastolicBP = 'Diastolic blood pressure is required';
        } else if (formData.diastolicBP < 40 || formData.diastolicBP > 150) {
          newErrors.diastolicBP = 'Diastolic BP must be between 40 and 150 mmHg';
        }
        break;
      case 3: // Exercise Habits
        if (!formData.exerciseFrequency) {
          newErrors.exerciseFrequency = 'Exercise frequency is required';
        }
        if (!formData.exerciseIntensity) {
          newErrors.exerciseIntensity = 'Exercise intensity is required';
        }
        if (!formData.exerciseDuration) {
          newErrors.exerciseDuration = 'Exercise duration is required';
        } else if (formData.exerciseDuration < 5 || formData.exerciseDuration > 180) {
          newErrors.exerciseDuration = 'Duration must be between 5 and 180 minutes';
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
    // Comprehensive fallback calculation for advanced assessment
    let riskScore = 20;
    
    // Age factor
    if (formData.age > 45) riskScore += 5;
    if (formData.age > 60) riskScore += 5;
    
    // BMI factor
    const bmi = parseFloat(formData.bmi);
    if (bmi > 25) riskScore += 8;
    if (bmi > 30) riskScore += 8;
    
    // Waist circumference
    const waist = parseFloat(formData.waistCircumference);
    if (formData.sex === 'male' && waist > 102) riskScore += 5;
    if (formData.sex === 'female' && waist > 88) riskScore += 5;
    
    // Blood glucose
    const glucose = parseFloat(formData.fastingGlucose);
    if (glucose > 100) riskScore += 8;
    if (glucose > 126) riskScore += 10;
    
    // Triglycerides
    const triglycerides = parseFloat(formData.triglycerides);
    if (triglycerides > 150) riskScore += 6;
    if (triglycerides > 200) riskScore += 6;
    
    // HDL (protective factor)
    const hdl = parseFloat(formData.hdl);
    if (formData.sex === 'male' && hdl < 40) riskScore += 8;
    if (formData.sex === 'female' && hdl < 50) riskScore += 8;
    if (hdl > 60) riskScore -= 5; // Protective
    
    // Blood pressure
    const systolic = parseFloat(formData.systolicBP);
    const diastolic = parseFloat(formData.diastolicBP);
    if (systolic > 130) riskScore += 5;
    if (systolic > 140) riskScore += 5;
    if (diastolic > 85) riskScore += 5;
    if (diastolic > 90) riskScore += 5;
    
    // Exercise (protective factor)
    const frequency = parseInt(formData.exerciseFrequency);
    const intensity = formData.exerciseIntensity;
    const duration = parseInt(formData.exerciseDuration);
    
    let exerciseBonus = 0;
    if (frequency >= 5) exerciseBonus += 10;
    else if (frequency >= 3) exerciseBonus += 6;
    else if (frequency >= 1) exerciseBonus += 3;
    
    if (intensity === 'vigorous') exerciseBonus += 5;
    else if (intensity === 'moderate') exerciseBonus += 3;
    
    if (duration >= 60) exerciseBonus += 5;
    else if (duration >= 30) exerciseBonus += 3;
    
    riskScore -= exerciseBonus;
    
    riskScore = Math.min(100, Math.max(0, riskScore));
    
    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High';
    
    const fallbackResult = {
      riskScore,
      riskLevel,
      prediction: riskLevel === 'High' ? 1 : 0,
      label: riskLevel === 'High' ? 'Insulin Resistant' : 'Normal',
      topRiskFactors: [],
      explanation: 'This is a comprehensive fallback calculation using all advanced metrics. The AI service was unavailable.',
      recommendations: [
        {
          category: 'Comprehensive Health Management',
          priority: riskLevel === 'High' ? 'high' : 'medium',
          items: [
            'Regular monitoring of blood glucose and blood pressure',
            'Maintain healthy cholesterol levels',
            'Follow a Mediterranean-style diet',
            'Engage in regular physical activity'
          ]
        },
        {
          category: 'Medical Follow-up',
          priority: riskLevel === 'High' ? 'high' : 'low',
          items: [
            'Schedule regular check-ups with healthcare provider',
            'Consider consulting with a nutritionist',
            'Monitor medication effectiveness if prescribed'
          ]
        }
      ],
      insights: [
        {
          type: 'info',
          message: 'This comprehensive assessment included lifestyle factors for the most accurate evaluation'
        }
      ],
      nextAssessmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          ? 'border-green-500 bg-green-50 text-green-700'
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Measure at navel level"
                min="50"
                max="200"
              />
              {errors.waistCircumference && (
                <p className="mt-1 text-sm text-red-600">{errors.waistCircumference}</p>
              )}
            </div>
            
            {formData.bmi && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Calculated BMI:</span> {formData.bmi}
                </p>
              </div>
            )}
          </div>
        );

      case 1: // Blood Markers
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  name="fastingGlucose"
                  value={formData.fastingGlucose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Glucose level"
                  min="50"
                  max="400"
                />
                {errors.fastingGlucose && (
                  <p className="mt-1 text-sm text-red-600">{errors.fastingGlucose}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triglycerides (mg/dL)
                </label>
                <input
                  type="number"
                  name="triglycerides"
                  value={formData.triglycerides}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Triglycerides"
                  min="20"
                  max="1000"
                />
                {errors.triglycerides && (
                  <p className="mt-1 text-sm text-red-600">{errors.triglycerides}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HDL Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  name="hdl"
                  value={formData.hdl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="HDL level"
                  min="20"
                  max="100"
                />
                {errors.hdl && (
                  <p className="mt-1 text-sm text-red-600">{errors.hdl}</p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Reference Ranges:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Glucose:</p>
                  <p>• Normal: &lt;100 mg/dL</p>
                  <p>• Prediabetes: 100-125 mg/dL</p>
                </div>
                <div>
                  <p className="font-medium">Triglycerides:</p>
                  <p>• Normal: &lt;150 mg/dL</p>
                  <p>• High: ≥200 mg/dL</p>
                </div>
                <div>
                  <p className="font-medium">HDL:</p>
                  <p>• Men: ≥40 mg/dL</p>
                  <p>• Women: ≥50 mg/dL</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Blood Pressure
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Systolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  name="systolicBP"
                  value={formData.systolicBP}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Systolic (top number)"
                  min="70"
                  max="250"
                />
                {errors.systolicBP && (
                  <p className="mt-1 text-sm text-red-600">{errors.systolicBP}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diastolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  name="diastolicBP"
                  value={formData.diastolicBP}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Diastolic (bottom number)"
                  min="40"
                  max="150"
                />
                {errors.diastolicBP && (
                  <p className="mt-1 text-sm text-red-600">{errors.diastolicBP}</p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Blood Pressure Categories:</p>
              <div className="text-sm">
                <p>• Normal: &lt;120/80 mmHg</p>
                <p>• Elevated: 120-129/&lt;80 mmHg</p>
                <p>• Stage 1 Hypertension: 130-139/80-89 mmHg</p>
                <p>• Stage 2 Hypertension: ≥140/90 mmHg</p>
              </div>
            </div>
          </div>
        );

      case 3: // Exercise Habits
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Frequency (days per week)
              </label>
              <select
                name="exerciseFrequency"
                value={formData.exerciseFrequency}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="0">No exercise</option>
                <option value="1">1 day per week</option>
                <option value="2">2 days per week</option>
                <option value="3">3 days per week</option>
                <option value="4">4 days per week</option>
                <option value="5">5 days per week</option>
                <option value="6">6 days per week</option>
                <option value="7">Every day</option>
              </select>
              {errors.exerciseFrequency && (
                <p className="mt-1 text-sm text-red-600">{errors.exerciseFrequency}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Intensity
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['light', 'moderate', 'vigorous'].map((intensity) => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, exerciseIntensity: intensity }))}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.exerciseIntensity === intensity
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="capitalize font-medium">{intensity}</span>
                  </button>
                ))}
              </div>
              {errors.exerciseIntensity && (
                <p className="mt-1 text-sm text-red-600">{errors.exerciseIntensity}</p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                <p>• Light: Walking, light stretching</p>
                <p>• Moderate: Brisk walking, cycling, swimming</p>
                <p>• Vigorous: Running, HIIT, competitive sports</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Exercise Duration (minutes per session)
              </label>
              <input
                type="number"
                name="exerciseDuration"
                value={formData.exerciseDuration}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Duration in minutes"
                min="5"
                max="180"
              />
              {errors.exerciseDuration && (
                <p className="mt-1 text-sm text-red-600">{errors.exerciseDuration}</p>
              )}
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
            Advanced Assessment
          </h1>
          <p className="text-gray-600">
            Complete evaluation with lifestyle factors (15 minutes)
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
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdvancedAssessment;
