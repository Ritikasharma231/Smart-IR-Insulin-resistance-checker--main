import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: HeartIcon,
      title: 'AI-Powered Assessments',
      description: 'Get accurate insulin resistance predictions using advanced machine learning models trained on clinical data',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ChartBarIcon,
      title: 'Track Your Progress',
      description: 'Monitor your health journey with comprehensive charts, detailed analytics, and trend analysis over time',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: UserGroupIcon,
      title: 'Personalized Recommendations',
      description: 'Receive AI-generated health advice tailored to your specific risk factors and health profile',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Medical-Grade Accuracy',
      description: 'Built with clinically validated algorithms and trusted by healthcare professionals worldwide',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const assessmentTypes = [
    {
      type: 'Basic',
      title: 'Quick Check',
      duration: '5 min',
      description: 'Basic health metrics for fast screening and initial risk assessment',
      color: 'bg-blue-100 text-blue-700',
      borderColor: 'border-blue-200',
      link: '/assessment/basic',
      features: ['Age, Sex, BMI', 'Waist Circumference', 'Quick Results']
    },
    {
      type: 'Intermediate',
      title: 'Comprehensive',
      duration: '10 min',
      description: 'Includes blood markers for better accuracy and detailed risk analysis',
      color: 'bg-purple-100 text-purple-700',
      borderColor: 'border-purple-200',
      link: '/assessment/intermediate',
      features: ['All Basic Metrics', 'Blood Glucose', 'Triglycerides', 'TyG Index']
    },
    {
      type: 'Advanced',
      title: 'Complete Analysis',
      duration: '15 min',
      description: 'Full evaluation with lifestyle factors for the most accurate assessment',
      color: 'bg-green-100 text-green-700',
      borderColor: 'border-green-200',
      link: '/assessment/advanced',
      features: ['All Intermediate Metrics', 'HDL Cholesterol', 'Blood Pressure', 'Exercise Habits']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient, 42',
      content: 'This app helped me understand my insulin resistance risk and take control of my health. The AI recommendations are spot-on!',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Endocrinologist',
      content: 'Finally, a tool that combines clinical accuracy with user-friendly design. I recommend it to all my patients.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random'
    },
    {
      name: 'James Wilson',
      role: 'Health Coach',
      content: 'The AI recommendations are incredibly accurate and help me guide my clients better. Game-changer for diabetes prevention.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=random'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '4.8/5', label: 'User Rating' },
    { number: '24/7', label: 'AI Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 section-padding">
        <div className="container-mfp">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 mb-4">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  AI-Powered Health Tracking
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Track Your
                  <span className="text-gradient"> Insulin Health</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Get AI-powered insights into your insulin resistance risk with our comprehensive health assessment platform. 
                  Trusted by healthcare professionals and users worldwide.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="mfp-btn-primary">
                      Go to Dashboard
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                    <Link to="/assessment/basic" className="mfp-btn-outline">
                      Take Assessment
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="mfp-btn-primary">
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                    <Link to="/login" className="mfp-btn-outline">
                      Sign In
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Clinically Validated</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl transform rotate-6"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-mfp">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Why Choose Insulin Tracker?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Advanced AI technology meets user-friendly design for the most comprehensive insulin resistance tracking experience
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="text-center group"
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-mfp">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Choose Your Assessment Level
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              From quick screenings to comprehensive evaluations, find the right assessment for your needs
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {assessmentTypes.map((assessment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="mfp-card mfp-card-hover h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${assessment.color} ${assessment.borderColor} border`}>
                      {assessment.type}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{assessment.duration}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {assessment.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {assessment.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-3">What's included:</div>
                    <ul className="space-y-2">
                      {assessment.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    to={assessment.link}
                    className="w-full mfp-btn-primary text-center inline-block"
                  >
                    Start Assessment
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container-mfp">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Get your personalized health insights in three simple steps
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Complete Assessment',
                description: 'Answer questions about your health, lifestyle, and medical history in our intuitive interface',
                icon: <PlayIcon className="h-6 w-6" />
              },
              {
                step: 2,
                title: 'AI Analysis',
                description: 'Our advanced algorithms analyze your data using machine learning models trained on clinical data',
                icon: <ChartBarIcon className="h-6 w-6" />
              },
              {
                step: 3,
                title: 'Get Results',
                description: 'Receive personalized insights, risk scores, and actionable recommendations for better health',
                icon: <HeartIcon className="h-6 w-6" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 -ml-8"></div>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-mfp">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Trusted by Health-Conscious Individuals
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              See what our users are saying about their experience
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="mfp-card h-full">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container-mfp text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have taken control of their insulin health with our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="mfp-btn-primary bg-white text-blue-600 hover:bg-gray-100"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/assessment/basic"
                className="mfp-btn-outline border-white text-white hover:bg-white hover:text-blue-600"
              >
                Try Quick Assessment
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
