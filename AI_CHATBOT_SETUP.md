# AI Chatbot Setup Guide

## Overview
The insulin tracker chatbot can be connected to real AI services for intelligent, dynamic responses instead of static text. This guide walks you through setting up the AI integration.

## Supported AI Services

### 1. OpenAI GPT (Recommended)
- **Model:** GPT-3.5-turbo
- **Cost:** ~$0.002 per 1K tokens
- **Features:** Excellent medical knowledge, natural conversations
- **Setup Time:** 5 minutes

### 2. Google Gemini
- **Model:** Gemini Pro
- **Cost:** Free tier available
- **Features:** Good general knowledge, fast responses
- **Setup Time:** 3 minutes

### 3. Anthropic Claude
- **Model:** Claude-3 Haiku
- **Cost:** ~$0.00025 per 1K tokens
- **Features:** Conservative, safe responses
- **Setup Time:** 5 minutes

## Quick Setup (5 Minutes)

### Option 1: OpenAI GPT (Recommended)

1. **Get API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up/login to OpenAI
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Configure Environment**
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit the .env file
   # Add your OpenAI API key:
   REACT_APP_OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart the App**
   ```bash
   npm start
   ```

### Option 2: Google Gemini (Free)

1. **Get API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Configure Environment**
   ```bash
   # Edit .env file
   REACT_APP_GEMINI_API_KEY=your-gemini-key-here
   REACT_APP_CHATBOT_SERVICE=gemini
   ```

3. **Restart the App**
   ```bash
   npm start
   ```

## Configuration Details

### Environment Variables

Create a `.env` file in your project root:

```env
# Primary: OpenAI Configuration
REACT_APP_OPENAI_API_KEY=sk-your-openai-key-here

# Alternative: Google Gemini
REACT_APP_GEMINI_API_KEY=your-gemini-key-here

# Alternative: Anthropic Claude
REACT_APP_CLAUDE_API_KEY=your-claude-key-here

# Service Selection (optional)
REACT_APP_CHATBOT_SERVICE=openai
```

### Service Selection

The chatbot automatically detects which service to use based on available API keys:

1. **OpenAI** (if `REACT_APP_OPENAI_API_KEY` is set)
2. **Gemini** (if `REACT_APP_GEMINI_API_KEY` is set)
3. **Claude** (if `REACT_APP_CLAUDE_API_KEY` is set)
4. **Fallback** (if no keys, uses rule-based responses)

## Features with AI Integration

### ✅ What the AI Can Do
- **Personalized Advice**: Based on user's assessment data
- **Dynamic Responses**: Context-aware conversations
- **Medical Knowledge**: Evidence-based health guidance
- **Risk Assessment**: Tailored to user's risk level
- **Nutrition Planning**: Vegetarian/non-vegetarian options
- **Exercise Programming**: Fitness level appropriate
- **Real-time Answers**: No hardcoded responses

### 🎯 AI Capabilities
- Understands user context and history
- Provides personalized meal plans
- Adjusts recommendations based on risk factors
- Answers follow-up questions intelligently
- Maintains conversation context
- Gives specific, actionable advice

### 📊 Data Integration
The AI automatically receives:
- User's risk score and level
- BMI, age, and health metrics
- Previous assessment results
- Dietary preferences
- Exercise capabilities

## Testing the Integration

### Test Commands
Try these commands to test AI responses:

1. **Basic Diet Query**
   ```
   "I'm a vegetarian with high risk score. What should I eat?"
   ```

2. **Exercise Planning**
   ```
   "Create a beginner exercise plan for someone with BMI 28"
   ```

3. **Risk-Specific Advice**
   ```
   "My fasting glucose is 110. What dietary changes do you recommend?"
   ```

4. **Follow-up Questions**
   ```
   "That breakfast plan sounds good. What about lunch options?"
   ```

### Expected AI Response Format
The AI will respond with:
- Clean tables (no asterisks or hashes)
- Emoji indicators for visual appeal
- Personalized recommendations
- Evidence-based advice
- Professional formatting

## Troubleshooting

### Common Issues

#### 1. "Using fallback mode" Message
**Problem:** API key not configured or invalid
**Solution:** Check your `.env` file and restart the app

#### 2. API Rate Limits
**Problem:** Too many requests to API
**Solution:** Wait a few minutes, usage will reset

#### 3. No Response
**Problem:** Network connectivity or API down
**Solution:** Check internet connection, try again later

#### 4. Cost Concerns
**Problem:** Worried about API costs
**Solution:** 
- OpenAI: ~$0.002 per 1K tokens (very affordable)
- Gemini: Free tier available
- Monitor usage in your API dashboard

### Debug Mode

To enable debug logging, add to your `.env`:
```env
REACT_APP_DEBUG_CHATBOT=true
```

This will show API requests and responses in the browser console.

## Security Notes

### API Key Protection
- Never commit `.env` files to version control
- API keys are client-side (for demo purposes)
- For production, consider server-side proxy

### Production Deployment
For production apps, consider:
1. Server-side API proxy
2. Rate limiting
3. Usage monitoring
4. Cost controls

## Advanced Configuration

### Custom Prompts
Edit `src/services/chatbotService.js` to customize:
- System prompts
- Response formatting
- Personality and tone
- Knowledge domains

### Multiple AI Services
The service supports:
- Automatic failover between services
- Load balancing
- Cost optimization
- Response quality comparison

## Support

### Getting Help
1. **API Issues**: Check respective API documentation
2. **Configuration Issues**: Review this guide
3. **Integration Problems**: Check browser console
4. **Cost Questions**: Review API pricing pages

### Resources
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Claude API Docs](https://docs.anthropic.com/claude/reference)

---

**Your AI chatbot is now ready for intelligent, personalized health conversations!** 🤖💚
