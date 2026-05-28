import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowLeftIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import patientDataService from '../services/patientDataService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAssessments, setPatientAssessments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAssessments: 0,
    highRiskCount: 0,
    assessmentsThisWeek: 0,
  });

  const loadData = async () => {
    try {
      const [patientList, adminStats] = await Promise.all([
        patientDataService.getAllPatients(),
        patientDataService.getAdminStats(),
      ]);
      setPatients(patientList);
      setStats(adminStats);
    } catch (e) {
      console.error('Admin load failed:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRiskColor = (level) => {
    const s = (level || '').toLowerCase();
    if (s.includes('low')) return 'text-green-600 bg-green-100 border-green-200';
    if (s.includes('moderate')) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (s.includes('high')) return 'text-red-600 bg-red-100 border-red-200';
    return 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q);
      const s = (p.latestRisk || '').toLowerCase();
      const matchesRisk =
        riskFilter === 'all' ||
        (riskFilter === 'high' && s.includes('high')) ||
        (riskFilter === 'moderate' && s.includes('moderate')) ||
        (riskFilter === 'low' && s.includes('low'));
      return matchesSearch && matchesRisk;
    });
  }, [patients, search, riskFilter]);

  const openPatient = async (patient) => {
    setSelectedPatient(patient);
    setPatientAssessments(await patientDataService.getAssessmentsForUser(patient.userId));
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Delete this assessment record?')) return;
    await patientDataService.deleteAssessment(id);
    if (selectedPatient) await openPatient(selectedPatient);
    await loadData();
  };

  const handleDeletePatient = async (userId) => {
    if (!window.confirm('Remove this patient and all their assessments? This cannot be undone.')) return;
    await patientDataService.deletePatient(userId);
    setSelectedPatient(null);
    await loadData();
  };

  const handleExport = async () => {
    const data = await patientDataService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-ir-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Records</h1>
              <p className="text-gray-600">Manage registered patients and their assessments</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-morphism rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="glass-morphism rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="glass-morphism rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">High Risk Results</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-morphism rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search patients</label>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email, or phone"
                  className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Risk</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="high">High Risk</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="low">Low Risk</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-end">
              <FunnelIcon className="h-4 w-4 mr-1" />
              {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          {filteredPatients.length === 0 ? (
            <div className="glass-morphism rounded-2xl p-12 text-center">
              <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
              <p className="text-gray-600">No patients match your current filters.</p>
            </div>
          ) : (
            filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                className="glass-morphism rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      {patient.latestRisk && patient.latestRisk !== '—' && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(patient.latestRisk)}`}
                        >
                          {patient.latestRisk}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600">
                      <div>{patient.email}</div>
                      <div>{patient.assessmentCount} assessments</div>
                      {patient.latestScore != null && <div>{patient.latestScore}% latest risk</div>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button
                      type="button"
                      onClick={() => openPatient(patient)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePatient(patient.userId)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Patient"
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

      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
                <p className="text-sm text-gray-600">{selectedPatient.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <h3 className="font-semibold text-gray-900">Assessment History</h3>
              {patientAssessments.length === 0 ? (
                <p className="text-sm text-gray-500">No assessments on file.</p>
              ) : (
                patientAssessments.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{a.type} Assessment</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(a.date).toLocaleDateString()} · {a.riskScore}% risk
                      </p>
                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(a.riskLevel)}`}
                      >
                        {a.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                      <button
                        type="button"
                        onClick={() => navigate('/results', { state: { assessment: a } })}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssessment(a.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
