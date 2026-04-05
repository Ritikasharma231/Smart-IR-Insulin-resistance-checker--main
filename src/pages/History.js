import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const History = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [assessments, filter, sortOrder]);

  const loadAssessments = () => {
    try {
      const storedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      setAssessments(storedAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...assessments];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(assessment => assessment.type.toLowerCase() === filter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOrder === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortOrder === 'risk-desc') {
        return b.riskScore - a.riskScore;
      } else if (sortOrder === 'risk-asc') {
        return a.riskScore - b.riskScore;
      }
      return 0;
    });

    setFilteredAssessments(filtered);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        const updatedAssessments = assessments.filter(a => a.id !== id);
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
      } catch (error) {
        console.error('Error deleting assessment:', error);
      }
    }
  };

  const handleViewResults = (assessment) => {
    navigate('/results', { state: { assessment } });
  };

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

  const getChartData = () => {
    return filteredAssessments.map(assessment => ({
      date: new Date(assessment.date).toLocaleDateString(),
      riskScore: assessment.riskScore,
      type: assessment.type
    })).reverse(); // Show oldest to newest in chart
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredAssessments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `insulin-resistance-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStats = () => {
    if (filteredAssessments.length === 0) return { total: 0, average: 0, trend: 'stable' };
    
    const total = filteredAssessments.length;
    const average = Math.round(filteredAssessments.reduce((sum, a) => sum + a.riskScore, 0) / total);
    
    let trend = 'stable';
    if (total >= 2) {
      const recent = filteredAssessments.slice(0, Math.min(5, total));
      const firstRecent = recent[recent.length - 1];
      const lastRecent = recent[0];
      
      if (lastRecent.riskScore > firstRecent.riskScore + 5) trend = 'increasing';
      else if (lastRecent.riskScore < firstRecent.riskScore - 5) trend = 'decreasing';
    }
    
    return { total, average, trend };
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assessment History
              </h1>
              <p className="text-gray-600">
                Track your insulin resistance journey over time
              </p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-morphism rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.average}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Risk Trend</p>
                <p className={`text-lg font-bold ${
                  stats.trend === 'increasing' ? 'text-red-600' :
                  stats.trend === 'decreasing' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {stats.trend === 'increasing' ? '📈' :
                   stats.trend === 'decreasing' ? '📉' : '➡️'}{' '}
                  {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FunnelIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        {filteredAssessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-morphism rounded-2xl p-8 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Score Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="riskScore" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-morphism rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="risk-desc">Highest Risk</option>
                  <option value="risk-asc">Lowest Risk</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredAssessments.length} {filteredAssessments.length === 1 ? 'assessment' : 'assessments'} found
            </div>
          </div>
        </motion.div>

        {/* Assessment List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          {filteredAssessments.length === 0 ? (
            <div className="glass-morphism rounded-2xl p-12 text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments Found</h3>
              <p className="text-gray-600 mb-6">
                {assessments.length === 0 
                  ? "You haven't completed any assessments yet." 
                  : "No assessments match your current filters."}
              </p>
              {assessments.length === 0 && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Your First Assessment
                </button>
              )}
            </div>
          ) : (
            filteredAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="glass-morphism rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {assessment.type} Assessment
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(assessment.riskLevel)}`}>
                        {assessment.riskLevel} Risk
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
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
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button
                      onClick={() => handleViewResults(assessment)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="View Results"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(assessment.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Assessment"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default History;
