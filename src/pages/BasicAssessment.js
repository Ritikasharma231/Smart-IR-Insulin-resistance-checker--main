import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  CalculatorIcon,
  ScaleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const BasicAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    type: 'Basic',
    age: '',
    sex: '',
    weight: '',
    height: '',
    waistCircumference: '',
    bmi: ''
  });
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState('');

  const steps = [
    { 
      title: 'Personal Information', 
      description: 'Age and sex for baseline assessment',
      icon: UserIcon
    },
    { 
      title: 'Body Measurements', 
      description: 'Weight, height, and waist circumference',
      icon: ScaleIcon
    },
    { 
      title: 'Review & Submit', 
      description: 'Confirm your information and get results',
      icon: CalculatorIcon
    }
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
      case 0: // Personal Information
        if (!formData.age) {
          newErrors.age = 'Age is required';
        } else if (formData.age < 18 || formData.age > 120) {
          newErrors.age = 'Age must be between 18 and 120';
        }
        if (!formData.sex) {
          newErrors.sex = 'Sex is required';
        }
        break;
      case 1: // Body Measurements
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
      case 2: // Review - no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
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
      // Call FastAPI backend with fallback support
      const backendResponse = await apiService.predictInsulinResistance(formData);
      
      // Check if this is a fallback result
      if (backendResponse.fallback) {
        console.warn('Using fallback prediction due to backend unavailability');
        // You could show a user-friendly message here
      }
      
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
      setApiError('Unable to complete assessment. Using offline calculation instead.');
      
      // Try fallback calculation
      try {
        const fallbackResult = apiService.getFallbackPrediction(formData);
        const result = apiService.mapFromBackendResponse(fallbackResult, formData);
        
        const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
        const newAssessment = {
          ...result,
          id: Date.now()
        };
        existingAssessments.unshift(newAssessment);
        localStorage.setItem('assessments', JSON.stringify(existingAssessments));
        
        navigate('/results', { state: { assessment: newAssessment } });
      } catch (fallbackError) {
        console.error('Fallback Error:', fallbackError);
        setApiError('Assessment failed. Please refresh and try again.');
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Render step content

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex flex-col items-center">
              <div className={`mfp-progress-step ${
                index < currentStep ? 'mfp-progress-step-completed' :
                index === currentStep ? 'mfp-progress-step-active' :
                'mfp-progress-step-pending'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs text-gray-600 mt-2 text-center hidden sm:block">
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mfp-label">
            Age <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={`mfp-input ${errors.age ? 'mfp-input-error' : ''}`}
            placeholder="Enter your age"
            min="18"
            max="120"
          />
          {errors.age && (
            <p className="error-message">{errors.age}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Age range: 18-120 years
          </p>
        </div>
        
        <div>
          <label className="mfp-label">
            Sex <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {['male', 'female'].map((sex) => (
              <button
                key={sex}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sex }))}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.sex === sex
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="capitalize font-medium">{sex}</span>
              </button>
            ))}
          </div>
          {errors.sex && (
            <p className="error-message">{errors.sex}</p>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Why we need this information:</p>
            <p>Age and sex are important baseline factors for insulin resistance risk assessment. Different age groups and sexes have different risk profiles.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBodyMeasurements = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="mfp-label">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className={`mfp-input ${errors.weight ? 'mfp-input-error' : ''}`}
            placeholder="Weight in kg"
            min="30"
            max="300"
            step="0.1"
          />
          {errors.weight && (
            <p className="error-message">{errors.weight}</p>
          )}
        </div>
        
        <div>
          <label className="mfp-label">
            Height (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className={`mfp-input ${errors.height ? 'mfp-input-error' : ''}`}
            placeholder="Height in cm"
            min="100"
            max="250"
          />
          {errors.height && (
            <p className="error-message">{errors.height}</p>
          )}
        </div>
        
        <div>
          <label className="mfp-label">
            Waist Circumference (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="waistCircumference"
            value={formData.waistCircumference}
            onChange={handleChange}
            className={`mfp-input ${errors.waistCircumference ? 'mfp-input-error' : ''}`}
            placeholder="Measure at navel level"
            min="50"
            max="200"
          />
          {errors.waistCircumference && (
            <p className="error-message">{errors.waistCircumference}</p>
          )}
        </div>
      </div>
      
      {formData.bmi && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Calculated BMI</p>
              <p className="text-2xl font-bold text-green-900">{formData.bmi}</p>
            </div>
            <div className="text-sm text-green-700">
              <p className="font-medium">BMI Categories:</p>
              <p>• Underweight: &lt;18.5</p>
              <p>• Normal: 18.5-24.9</p>
              <p>• Overweight: 25-29.9</p>
              <p>• Obese: ≥30</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How to measure waist circumference:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stand straight and relax</li>
              <li>Measure at the level of your navel</li>
              <li>Keep the tape measure snug but not tight</li>
              <li>Measure after exhaling normally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="mfp-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Personal Information</h4>
            <dl className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <dt className="text-gray-600">Age:</dt>
                <dd className="font-medium">{formData.age} years</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <dt className="text-gray-600">Sex:</dt>
                <dd className="font-medium capitalize">{formData.sex}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Body Measurements</h4>
            <dl className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <dt className="text-gray-600">Weight:</dt>
                <dd className="font-medium">{formData.weight} kg</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <dt className="text-gray-600">Height:</dt>
                <dd className="font-medium">{formData.height} cm</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <dt className="text-gray-600">Waist:</dt>
                <dd className="font-medium">{formData.waistCircumference} cm</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gray-600">BMI:</dt>
                <dd className="font-medium">{formData.bmi}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important:</p>
              <p>Please review your information carefully before submitting. This assessment will provide personalized insights based on your current health metrics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderBodyMeasurements();
      case 2:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-mfp py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Basic Assessment
                </h1>
                <p className="text-gray-600">
                  Quick 5-minute health check with basic metrics
                </p>
              </div>
              <div className="hidden md:block">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {steps[currentStep].title}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Content */}
          <div className="mfp-card">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="h-6 w-6 text-blue-600 mr-3" />;
                })()}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-gray-600">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
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
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={isCalculating}
                className="flex items-center px-6 py-3 mfp-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <div className="loading-spinner h-4 w-4 mr-2"></div>
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
    </div>
  );
};

export default BasicAssessment;
