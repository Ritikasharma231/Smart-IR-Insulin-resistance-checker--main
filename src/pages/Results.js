import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to format AI explanation into structured content
  const formatExplanation = (explanation) => {
    if (!explanation) return [];
    
    // Split by double newlines to get paragraphs
    const paragraphs = explanation.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map(paragraph => {
      // Clean up common formatting issues
      return paragraph
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/^\s+|\s+$/g, '')  // Trim leading/trailing spaces
        .replace(/\*\*/g, '')  // Remove asterisks
        .trim();
    }).filter(p => p.length > 0);
  };

  // Helper function to extract key insights from AI explanation
  const extractKeyInsights = (explanation) => {
    if (!explanation) return [];
    
    const insights = [];
    const text = explanation.toLowerCase();
    
    // Common positive indicators
    if (text.includes('normal') || text.includes('healthy')) {
      insights.push('Your results indicate normal insulin sensitivity');
    }
    if (text.includes('low risk')) {
      insights.push('Current risk factors are well-managed');
    }
    if (text.includes('moderate risk')) {
      insights.push('Some lifestyle adjustments may be beneficial');
    }
    if (text.includes('weight') || text.includes('bmi')) {
      insights.push('Weight management is a key factor for your insulin sensitivity');
    }
    if (text.includes('exercise') || text.includes('physical activity')) {
      insights.push('Regular exercise can significantly improve insulin sensitivity');
    }
    
    return insights.slice(0, 4); // Limit to 4 key insights
  };

  // Helper function to extract important factors from AI explanation
  const extractImportantFactors = (explanation) => {
    if (!explanation) return [];
    
    const factors = [];
    const text = explanation.toLowerCase();
    
    // Extract common risk factors mentioned
    if (text.includes('bmi') || text.includes('body mass')) {
      factors.push('Body Mass Index (BMI) is a significant factor');
    }
    if (text.includes('waist') || text.includes('abdominal')) {
      factors.push('Waist circumference affects insulin resistance');
    }
    if (text.includes('age')) {
      factors.push('Age influences insulin sensitivity');
    }
    if (text.includes('diet') || text.includes('nutrition')) {
      factors.push('Diet plays a crucial role in insulin sensitivity');
    }
    if (text.includes('physical activity') || text.includes('exercise')) {
      factors.push('Physical activity levels impact insulin resistance');
    }
    
    return factors.slice(0, 4); // Limit to 4 factors
  };

  // Helper function to format risk factor title
  const formatRiskFactorTitle = (factor) => {
    if (!factor) return '';
    
    // Extract the main factor name (before "increased/decreased risk")
    const match = factor.match(/^(\w+(?:\s+\w+)*)/i);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : factor;
  };

  // Helper function to format risk factor impact
  const formatRiskFactorImpact = (factor) => {
    if (!factor) return '';
    
    if (factor.includes('increased risk')) {
      return '⚠️ Increases your risk';
    } else if (factor.includes('decreased risk')) {
      return '✅ Protective factor';
    } else {
      return '📊 Influences your risk';
    }
  };

  // Helper function to format risk factor description
  const formatRiskFactorDescription = (factor) => {
    if (!factor) return '';
    
    // Extract the impact percentage if present
    const impactMatch = factor.match(/impact\s+([-\d.]+)/i);
    const impact = impactMatch ? ` (${impactMatch[1]}% impact)` : '';
    
    // Clean up the description
    let description = factor
      .replace(/\s*\(impact\s*[-\d.]+%\)/gi, '')
      .replace(/increased risk|decreased risk/gi, '')
      .trim();
    
    return description + impact;
  };

  useEffect(() => {
    // Get assessment from location state or localStorage
    if (location.state?.assessment) {
      setAssessment(location.state.assessment);
    } else {
      // Try to get the most recent assessment from localStorage
      const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      if (assessments.length > 0) {
        setAssessment(assessments[0]);
      } else {
        navigate('/dashboard');
      }
    }
  }, [location.state, navigate]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'High':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'Low':
        return CheckCircleIcon;
      case 'Moderate':
        return ExclamationTriangleIcon;
      case 'High':
        return ExclamationTriangleIcon;
      default:
        return HeartIcon;
    }
  };

  const generateChartData = () => {
    if (!assessment) return [];
    
    return [
      { name: 'Age', value: assessment.age * 2, max: 100 },
      { name: 'BMI', value: Math.min(assessment.bmi * 2, 100), max: 100 },
      { name: 'Waist', value: Math.min(assessment.waistCircumference * 0.8, 100), max: 100 },
      { name: 'Overall', value: assessment.riskScore, max: 100 }
    ];
  };

  const generateRiskDistribution = () => {
    if (!assessment) return [];
    
    return [
      { name: 'Low Risk', value: 100 - assessment.riskScore, color: '#10b981' },
      { name: 'Current Risk', value: assessment.riskScore, color: '#ef4444' }
    ];
  };

  const handleDownloadReport = () => {
    // Create a simple text report
    const report = `
Insulin Resistance Assessment Report
=====================================
Date: ${new Date(assessment.date).toLocaleDateString()}
Assessment Type: ${assessment.type}

Personal Information:
- Age: ${assessment.age}
- Sex: ${assessment.sex}
- BMI: ${assessment.bmi}
- Waist Circumference: ${assessment.waistCircumference} cm

Results:
- Risk Level: ${assessment.riskLevel}
- Risk Score: ${assessment.riskScore}%
- Prediction: ${assessment.label}

AI Explanation:
${assessment.explanation}

Top Risk Factors:
${assessment.topRiskFactors?.join('\n') || 'N/A'}

Recommendations:
${assessment.recommendations?.map(rec => 
  `${rec.category}:\n${rec.items.join('\n')}`
).join('\n\n') || 'N/A'}

Next Assessment Recommended: ${new Date(assessment.nextAssessmentDate).toLocaleDateString()}

---
Generated by Insulin Tracker App
    `.trim();

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insulin-resistance-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Insulin Resistance Assessment Results',
          text: `I just completed an insulin resistance assessment. My risk level is ${assessment.riskLevel} with a risk score of ${assessment.riskScore}%.`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const RiskIcon = getRiskIcon(assessment.riskLevel);
  const chartData = generateChartData();
  const riskDistribution = generateRiskDistribution();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
            Assessment Results
          </h1>
          <p className="text-gray-600">
            Your personalized insulin resistance risk analysis
          </p>
        </div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-morphism rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getRiskColor(assessment.riskLevel)} mb-4`}>
                <RiskIcon className="h-5 w-5 mr-2" />
                <span className="font-semibold">{assessment.riskLevel} Risk</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment.riskScore}% Risk Score
              </h2>
              <p className="text-gray-600">
                Prediction: {assessment.label}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleShare}
                className="p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownloadReport}
                className="p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Risk Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {riskDistribution.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* AI Explanation */}
        {assessment.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-morphism rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <SparklesIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                AI-Powered Health Analysis
              </h3>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <h4 className="text-lg font-semibold text-gray-900">What This Means For You</h4>
              </div>
              <div className="text-gray-800 leading-relaxed space-y-4">
                {formatExplanation(assessment.explanation).map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Key Insights</h4>
                </div>
                <ul className="space-y-2">
                  {extractKeyInsights(assessment.explanation).map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Important Factors</h4>
                </div>
                <ul className="space-y-2">
                  {extractImportantFactors(assessment.explanation).map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Risk Factors */}
        {assessment.topRiskFactors && assessment.topRiskFactors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-morphism rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Your Key Risk Factors
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.topRiskFactors.map((factor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {formatRiskFactorTitle(factor)}
                      </h4>
                      <div className="text-xs text-gray-600">
                        {formatRiskFactorImpact(factor)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {formatRiskFactorDescription(factor)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {assessment.recommendations && assessment.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-morphism rounded-2xl p-8 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Personalized Recommendations
            </h3>
            <div className="space-y-6">
              {assessment.recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{rec.category}</h4>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {rec.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-morphism rounded-2xl p-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Next Assessment Recommended</h3>
                <p className="text-gray-600">
                  {new Date(assessment.nextAssessmentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Results;
