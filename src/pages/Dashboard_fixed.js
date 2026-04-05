import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  SparklesIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    lastAssessmentDate: null,
    riskTrend: 'stable'
  });

  useEffect(() => {
    // Load data from localStorage
    const loadDashboardData = () => {
      try {
        const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
        setRecentAssessments(assessments.slice(0, 3));
        
        setStats({
          totalAssessments: assessments.length,
          lastAssessmentDate: assessments.length > 0 ? assessments[0].date : null,
          riskTrend: calculateRiskTrend(assessments)
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  const calculateRiskTrend = (assessments) => {
    if (assessments.length < 2) return 'stable';
    
    const latest = assessments[0]?.riskScore || 0;
    const previous = assessments[1]?.riskScore || 0;
    
    if (latest > previous + 5) return 'increasing';
    if (latest < previous - 5) return 'decreasing';
    return 'stable';
  };

  // Helper function to format AI insights for dashboard preview
  const formatAIInsightPreview = (explanation) => {
    if (!explanation) return 'No AI insights available';
    
    // Extract first meaningful sentence or key insight
    const sentences = explanation.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length > 0) {
      let preview = sentences[0].trim();
      
      // Limit length for dashboard display
      if (preview.length > 120) {
        preview = preview.substring(0, 120) + '...';
      }
      
      return preview;
    }
    
    return 'AI analysis available in full results';
  };

  const getRiskTrendColor = () => {
    switch (stats.riskTrend) {
      case 'increasing':
        return 'text-red-600';
      case 'decreasing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskTrendIcon = () => {
    switch (stats.riskTrend) {
      case 'increasing':
        return '↑';
      case 'decreasing':
        return '↓';
      default:
        return '→';
    }
  };

  const assessmentCards = [
    {
      type: 'Basic',
      title: 'Quick Check',
      description: '5-minute basic health screening',
      duration: '5 min',
      icon: HeartIcon,
      color: 'bg-blue-100 text-blue-700',
      link: '/assessment/basic'
    },
    {
      type: 'Intermediate',
      title: 'Detailed Analysis',
      description: 'Comprehensive assessment with blood markers',
      duration: '10 min',
      icon: CalculatorIcon,
      color: 'bg-purple-100 text-purple-700',
      link: '/assessment/intermediate'
    },
    {
      type: 'Advanced',
      title: 'Complete Evaluation',
      description: 'Full health profile with advanced metrics',
      duration: '15 min',
      icon: ChartBarIcon,
      color: 'bg-green-100 text-green-700',
      link: '/assessment/advanced'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Your health dashboard
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="mfp-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.totalAssessments}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <HeartIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="mfp-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Assessment</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.lastAssessmentDate 
                  ? new Date(stats.lastAssessmentDate).toLocaleDateString()
                  : 'No assessments yet'
                }
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="mfp-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Risk Trend</p>
              <p className={`text-lg font-bold ${getRiskTrendColor()}`}>
                {getRiskTrendIcon()} {stats.riskTrend.charAt(0).toUpperCase() + stats.riskTrend.slice(1)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assessment Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Start New Assessment</h2>
          <Link
            to="/history"
            className="mfp-nav-link"
          >
            View History
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessmentCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Link to={card.link}>
                  <div className="mfp-card mfp-card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${card.color}`}>
                        {card.type}
                      </span>
                      <span className="text-sm text-gray-500">{card.duration}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <Icon className="h-6 w-6 text-gray-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {card.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Start Assessment</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Assessments</h2>
            <Link
              to="/history"
              className="mfp-nav-link"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="mfp-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {assessment.type} Assessment
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          assessment.riskLevel === 'Low' ? 'risk-low' :
                          assessment.riskLevel === 'Moderate' ? 'risk-moderate' :
                          'risk-high'
                        }`}>
                          {assessment.riskLevel} Risk
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(assessment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          {assessment.riskScore}% risk score
                        </div>
                        {assessment.age && (
                          <div>Age: {assessment.age}</div>
                        )}
                        {assessment.bmi && (
                          <div>BMI: {assessment.bmi}</div>
                        )}
                      </div>
                      
                      {/* AI Insights Preview */}
                      {assessment.explanation && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mt-3">
                          <div className="flex items-center mb-2">
                            <SparklesIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-xs font-semibold text-blue-900">AI Insights</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                            {formatAIInsightPreview(assessment.explanation)}
                          </p>
                        </div>
                      )}
                    </div>
                    <Link
                      to="/results"
                      state={{ assessment }}
                      className="mfp-btn-secondary text-sm py-2 px-4"
                    >
                      View Results
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
