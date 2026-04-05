import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState({
    shareData: false,
    publicProfile: false,
    emailNotifications: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify({
      notifications,
      privacy
    }));
    
    // Show success message (in a real app, you'd use a toast notification)
    alert('Settings saved successfully!');
  };

  useEffect(() => {
    // Load settings from localStorage
    try {
      const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      if (settings.notifications !== undefined) {
        setNotifications(settings.notifications);
      }
      if (settings.privacy) {
        setPrivacy(settings.privacy);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const getAssessmentStats = () => {
    try {
      const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      const total = assessments.length;
      const basic = assessments.filter(a => a.type === 'Basic').length;
      const intermediate = assessments.filter(a => a.type === 'Intermediate').length;
      const advanced = assessments.filter(a => a.type === 'Advanced').length;
      
      return { total, basic, intermediate, advanced };
    } catch (error) {
      return { total: 0, basic: 0, intermediate: 0, advanced: 0 };
    }
  };

  const stats = getAssessmentStats();

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="h-24 w-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-700">Name</span>
            </div>
            <span className="text-gray-900 font-medium">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-700">Email</span>
            </div>
            <span className="text-gray-900 font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-700">Member Since</span>
            </div>
            <span className="text-gray-900 font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.basic}</div>
            <div className="text-sm text-gray-600">Basic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.intermediate}</div>
            <div className="text-sm text-gray-600">Intermediate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.advanced}</div>
            <div className="text-sm text-gray-600">Advanced</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Change Password
          </button>
          <p className="text-sm text-gray-600">
            Last password change: Never
          </p>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Enable 2FA</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Login History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-gray-900">Current Session</p>
              <p className="text-sm text-gray-600">Chrome on Windows • {new Date().toLocaleDateString()}</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Assessment Reminders</p>
              <p className="text-sm text-gray-600">Get reminded when it's time for your next assessment</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Health Tips</p>
              <p className="text-sm text-gray-600">Receive personalized health recommendations</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Browser Notifications</p>
              <p className="text-sm text-gray-600">Get notified in your browser</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Share Data for Research</p>
              <p className="text-sm text-gray-600">Help improve our AI models by sharing anonymized data</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, shareData: !prev.shareData }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.shareData ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.shareData ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Public Profile</p>
              <p className="text-sm text-gray-600">Make your profile visible to other users</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, publicProfile: !prev.publicProfile }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.publicProfile ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.publicProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Download My Data
          </button>
          <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete My Account
          </button>
        </div>
      </div>

      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Insulin Tracker Version 1.0.0</p>
          <p>© 2024 Insulin Tracker. All rights reserved.</p>
          <div className="flex space-x-4 pt-2">
            <button className="text-blue-600 hover:text-blue-700">Terms of Service</button>
            <button className="text-blue-600 hover:text-blue-700">Privacy Policy</button>
            <button className="text-blue-600 hover:text-blue-700">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64">
            <div className="glass-morphism rounded-xl p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
            
            {(activeTab === 'notifications' || activeTab === 'preferences') && (
              <div className="mt-6">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
