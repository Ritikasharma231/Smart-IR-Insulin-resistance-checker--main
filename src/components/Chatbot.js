import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Hello! I'm your AI health assistant. I can help you understand insulin resistance, assess your risk factors, and provide personalized health advice. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "What is insulin resistance?",
        "Assess my risk factors",
        "Get health recommendations",
        "Explain my recent results"
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setTypingIndicator(true);

    try {
      // Get AI response from backend
      const response = await getChatbotResponse(messageText.trim());
      
      console.log('Full response object:', response); // Debug
      console.log('Response content:', response.content); // Debug
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response || response.content || 'No content available',
        timestamp: new Date(),
        suggestions: response.suggestions || [],
        riskAssessment: response.riskAssessment || null
      };

      console.log('Bot message:', botMessage); // Debug
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now. Please try again in a moment or use our assessment tools for immediate health insights.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const getChatbotResponse = async (message) => {
    try {
      // Try backend first
      const response = await fetch(API_ENDPOINTS.BACKEND.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          message: message,
          user_context: getUserContext()
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData;
      }
    } catch (error) {
      console.log('Backend not available, using fallback');
    }

    // Simple hardcoded fallback
    return getHardcodedResponse(message);
  };

  const getHardcodedResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        content: "Hello! I'm your AI health assistant.\n\nI can help you:\n• Understand insulin resistance\n• Assess your risk factors\n• Get personalized health recommendations\n• Explain your assessment results\n\nWhat would you like to know?",
        suggestions: [
          "What is insulin resistance?",
          "Assess my risk factors",
          "Get health recommendations",
          "Explain my recent results"
        ]
      };
    }
    
    // Insulin resistance basics
    if (lowerMessage.includes('what is insulin resistance')) {
      return {
        content: "**What is Insulin Resistance?**\n\nInsulin resistance is a condition where your body's cells become less responsive to insulin, a hormone that regulates blood sugar levels.\n\n**Key Points:**\n• Blood sugar levels can rise\n• Increases risk of type 2 diabetes\n• Often reversible with lifestyle changes\n• May have no obvious symptoms initially\n\n**Good News:** With proper diet, exercise, and lifestyle changes, many people can improve their insulin sensitivity significantly.",
        suggestions: [
          "What are the risk factors?",
          "How can I improve insulin sensitivity?",
          "What are the symptoms?"
        ]
      };
    }
    
    // Risk factors
    if (lowerMessage.includes('risk factor') || lowerMessage.includes('risk factors')) {
      return {
        content: "**Major Risk Factors for Insulin Resistance:**\n\n**Modifiable Factors:**\n• Excess body weight (especially abdominal fat)\n• Sedentary lifestyle\n• Diet high in processed foods and sugar\n• Poor sleep quality\n• Chronic stress\n\n**Non-Modifiable Factors:**\n• Family history of diabetes\n• Age over 45\n• Certain ethnic backgrounds\n• High blood pressure\n• Abnormal cholesterol levels\n\n**Action Steps:** Focus on the modifiable factors - even small changes can make a big difference!",
        suggestions: [
          "How to reduce abdominal fat",
          "Best exercises for insulin sensitivity",
          "Foods that improve insulin sensitivity"
        ]
      };
    }
    
    // Diet recommendations
    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return {
        content: "**Optimal Diet for Insulin Resistance:**\n\n**Focus on These Foods:**\n• High-fiber vegetables (broccoli, spinach, kale)\n• Lean proteins (chicken, fish, tofu)\n• Healthy fats (avocado, nuts, olive oil)\n• Whole grains (quinoa, brown rice, oats)\n• Low-glycemic fruits (berries, apples)\n\n**Limit or Avoid:**\n• Sugary drinks and desserts\n• White bread and pasta\n• Processed foods\n• Excessive alcohol\n\n**Recommended Pattern:** Mediterranean diet is excellent for insulin sensitivity. Aim for balanced meals with protein, healthy fats, and complex carbs.",
        suggestions: [
          "Sample meal plan",
          "Foods to avoid",
          "Best breakfast options"
        ]
      };
    }
    
    // Exercise
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('physical activity')) {
      return {
        content: "**Exercise for Insulin Sensitivity:**\n\n**Recommended Routine:**\n• 150 minutes weekly of moderate activity\n• 2 strength training sessions per week\n• Even 10-minute walks after meals help\n\n**Best Exercises:**\n• Brisk walking or cycling\n• Swimming or water aerobics\n• Resistance training with weights\n• Yoga and stretching\n\n**Key Principle:** Consistency matters more than intensity. Start slow and gradually increase duration and intensity.\n\n**Pro Tip:** A 10-minute walk after each meal can significantly improve blood sugar control!",
        suggestions: [
          "Beginner exercise plan",
          "Best exercises for insulin resistance",
          "How to start exercising"
        ]
      };
    }
    
    // Symptoms
    if (lowerMessage.includes('symptom') || lowerMessage.includes('signs')) {
      return {
        content: "**Common Symptoms of Insulin Resistance:**\n\n**Early Signs:**\n• Fatigue, especially after meals\n• Increased hunger or cravings\n• Difficulty concentrating\n• Frequent urination\n• Increased thirst\n\n**Physical Signs:**\n• Dark patches on skin (acanthosis nigricans)\n• Slow healing sores\n• Weight gain, especially around waist\n• Skin tags\n\n**Important:** Many people have no symptoms initially. Regular check-ups and risk assessment are crucial for early detection.",
        suggestions: [
          "When to see a doctor",
          "How to get tested",
          "Reversing early symptoms"
        ]
      };
    }
    
    // Assessment results
    if (lowerMessage.includes('my results') || lowerMessage.includes('my assessment') || lowerMessage.includes('my score')) {
      const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      const latest = assessments[0];
      
      if (latest) {
        return {
          content: `Your latest assessment shows a ${latest.riskLevel.toLowerCase()} risk level (${latest.riskScore}%). ${latest.explanation || 'Your results indicate areas where lifestyle changes could help improve your insulin sensitivity.'}`,
          suggestions: [
            "Explain my risk factors",
            "Personalized recommendations",
            "How to improve my score"
          ]
        };
      } else {
        return {
          content: "I don't see any previous assessments. Would you like to start a quick assessment to evaluate your insulin resistance risk?",
          suggestions: [
            "Start Basic Assessment",
            "What assessments are available?",
            "Risk factors to check"
          ]
        };
      }
    }
    
    // Prevention/Improvement
    if (lowerMessage.includes('prevent') || lowerMessage.includes('improve') || lowerMessage.includes('reverse')) {
      return {
        content: "You can improve insulin sensitivity through: losing 5-10% of body weight, regular exercise, adequate sleep (7-9 hours), stress management, and a balanced diet. Even small changes can make a big difference in 3-6 months!",
        suggestions: [
          "Weight loss strategies",
          "Stress reduction techniques",
          "Sleep improvement tips"
        ]
      };
    }
    
    // Default response
    return {
      content: "I'm here to help with insulin resistance questions! I can explain the condition, assess risk factors, provide diet and exercise recommendations, and help interpret your assessment results. What would you like to know?",
      suggestions: [
        "What is insulin resistance?",
        "Assess my risk factors",
        "Diet recommendations",
        "Exercise guidelines"
      ]
    };
  };

  const getUserContext = () => {
    // Get user's assessment history for context
    const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    const recentAssessment = assessments[0];
    
    return {
      recentAssessment: recentAssessment ? {
        riskLevel: recentAssessment.riskLevel,
        riskScore: recentAssessment.riskScore,
        date: recentAssessment.date
      } : null,
      totalAssessments: assessments.length,
      hasHistory: assessments.length > 0
    };
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAssessment = async () => {
    setIsLoading(true);
    setTypingIndicator(true);

    try {
      // Get user's latest assessment for context
      const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      const latestAssessment = assessments[0];

      if (latestAssessment) {
        const response = {
          content: `Based on your latest assessment from ${new Date(latestAssessment.date).toLocaleDateString()}, you have a ${latestAssessment.riskLevel.toLowerCase()} risk level with a score of ${latestAssessment.riskScore}%. ${latestAssessment.explanation || 'Would you like me to explain your specific risk factors in more detail?'}`,
          suggestions: [
            "Explain my risk factors",
            "Get personalized recommendations",
            "How to improve my score",
            "Schedule next assessment"
          ]
        };
        
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: response.content,
          timestamp: new Date(),
          suggestions: response.suggestions
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        const response = {
          content: "I don't see any previous assessments. Would you like to start a quick basic assessment to evaluate your insulin resistance risk?",
          suggestions: [
            "Start Basic Assessment",
            "Learn about risk factors",
            "What assessments are available?"
          ]
        };
        
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: response.content,
          timestamp: new Date(),
          suggestions: response.suggestions
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Quick assessment error:', error);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Helper function to format bot messages with better structure
  const formatBotMessage = (content) => {
    if (!content) return '';
    
    // Split content into paragraphs and format
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Check if this is a heading (contains ** or starts with #)
      if (paragraph.includes('**') || paragraph.startsWith('#')) {
        // Format as heading
        const cleanText = paragraph.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
        return (
          <div key={index} className="font-semibold text-gray-900 mb-2 mt-3">
            {cleanText}
          </div>
        );
      }
      
      // Check if this is a list item (starts with - or •)
      if (paragraph.match(/^[-•]\s+/)) {
        const cleanText = paragraph.replace(/^[-•]\s+/, '').trim();
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-gray-700">{cleanText}</span>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-3 text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <ChatBubbleLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI Health Assistant</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <PlusIcon className="h-5 w-5" /> : <MinusIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-center space-x-2 mb-1 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {message.type === 'bot' && (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <SparklesIcon className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {message.type === 'user' && (
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.type === 'bot' ? formatBotMessage(message.content) : message.content}
                      </div>
                      
                      {/* Risk Assessment Display */}
                      {message.riskAssessment && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-800">
                              Risk Assessment
                            </span>
                          </div>
                          <div className="text-xs text-blue-700">
                            <p>Level: {message.riskAssessment.level}</p>
                            <p>Score: {message.riskAssessment.score}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingIndicator && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <SparklesIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500">AI is typing...</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-white border-t border-gray-200">
              <button
                onClick={handleQuickAssessment}
                disabled={isLoading}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : '📊 Quick Assessment Check'}
              </button>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your health..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
