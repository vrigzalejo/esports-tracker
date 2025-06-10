# OpenAI Free Tier Integration Setup

## Overview
The AI Match Analyst feature uses OpenAI's GPT-3.5-turbo (best free model) to provide professional esports match analysis with real AI predictions, odds calculation, and detailed reasoning. Uses OpenAI's free tier with $5 in free credits!

## Setup Instructions

### 1. Install OpenAI Package
```bash
npm install openai
```

### 2. Get Free OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up for a free account (gets $5 in free credits)
3. Create a new API key
4. Copy the API key (starts with `sk-`)

### 3. Configure Environment Variables
Create a `.env.local` file in your project root:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Never commit your API key to version control!

### 4. Verify Integration
1. Start your development server: `npm run dev`
2. Open any match card
3. Click the "AI" button (brain icon)
4. The AI assistant provides real ChatGPT analysis

### 5. Smart Fallback System
The system automatically handles different scenarios:
- **With API Key + Credits:** Uses real OpenAI GPT-3.5-turbo
- **With API Key + No Credits:** Falls back to intelligent algorithmic analysis
- **No API Key:** Uses intelligent algorithmic analysis
- **API Errors:** Seamlessly falls back to algorithmic analysis

The system always works and provides professional analysis!

## Features

### Real AI Analysis Includes:
- **Win Probability Calculation** - Percentage odds for each team
- **Professional Predictions** - AI-powered winner selection
- **Confidence Levels** - How certain the AI is about the prediction
- **Key Factors Analysis** - Important elements affecting the match
- **Detailed Reasoning** - Step-by-step explanation of the analysis

### AI Considers:
- Recent tournament performance
- Head-to-head historical records
- Team synergy and chemistry
- Meta adaptation and patch knowledge
- Regional advantages
- Tournament experience
- Current form and momentum

## Cost Considerations
- **FREE TIER AVAILABLE** - $5 in free credits for new accounts
- Uses GPT-3.5-turbo (best free model available)
- Typical cost: ~$0.002 per analysis (very affordable)
- Free credits cover ~2,500 analyses
- Fallback to free algorithmic analysis if credits run out

## Error Handling
The system gracefully handles:
- Missing API key (shows configuration message)
- API failures (shows retry option)
- Invalid responses (fallback error handling)
- Rate limiting (proper error messages)

## Security Notes
- API key is only used server-side
- No sensitive data is sent to OpenAI
- All requests are properly validated
- Environment variables are secure

## Troubleshooting

### "Configuration Required" Error
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Verify the API key is valid and active
- Restart your development server

### "Analysis Failed" Error
- Check your OpenAI account has sufficient credits
- Verify API key permissions
- Check network connectivity

### Package Not Found Error
- Run `npm install openai`
- Restart your development server
- Check package.json includes openai dependency

## Support
For issues with the OpenAI integration, check:
1. [OpenAI Documentation](https://platform.openai.com/docs)
2. [OpenAI Status Page](https://status.openai.com/)
3. Your OpenAI account usage and billing 