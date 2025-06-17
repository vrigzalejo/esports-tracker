# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for your Esports Tracker application to track user engagement, page views, and esports-specific events.

## 🎯 Overview

The Esports Tracker includes comprehensive Google Analytics integration that automatically tracks:

- **Page Views**: All page visits across the application
- **User Engagement**: Time spent on pages and user interactions
- **Esports-Specific Events**: Match views, tournament visits, team page visits, and more
- **Feature Usage**: AI odds assistant usage, search queries, and filters
- **Performance Metrics**: API response times and error tracking

## 🚀 Quick Setup

### Step 1: Create Google Analytics Property

1. Visit [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Click "Start measuring" or "Create Property"
4. Fill in your property details:
   - **Property name**: "Esports Tracker" (or your preferred name)
   - **Reporting time zone**: Select your timezone
   - **Currency**: Select your preferred currency
5. Configure your business information
6. Accept the terms of service

### Step 2: Get Your Measurement ID

1. In your GA4 property, go to **Admin** (gear icon)
2. Under **Property**, click **Data Streams**
3. Click **Add stream** → **Web**
4. Enter your website details:
   - **Website URL**: Your domain (e.g., `https://yourdomain.com`)
   - **Stream name**: "Esports Tracker Web"
5. Click **Create stream**
6. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Configure Environment Variables

Add your Measurement ID to your environment variables:

```bash
# In your .env.local file
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

### Step 4: Restart Your Application

```bash
npm run dev
```

Your Google Analytics is now active! 🎉

## 📊 What Gets Tracked

### Automatic Tracking

The application automatically tracks:

- **Page Views**: Every page visit with full URL and title
- **User Sessions**: Session duration and user engagement
- **Device Information**: Browser, device type, and screen resolution
- **Geographic Data**: Country, region, and city (anonymized)
- **Traffic Sources**: How users arrive at your site

### Custom Events

#### Esports-Specific Events

- **Match Views**: `view_match` - When users view match details
- **Tournament Views**: `view_tournament` - When users visit tournament pages
- **Team Views**: `view_team` - When users visit team pages
- **Player Views**: `view_player` - When users view player profiles
- **Standings Views**: `view_standings` - When users check tournament standings
- **Roster Views**: `view_roster` - When users view team rosters

#### User Interactions

- **Search Queries**: `search` - Track search terms and result counts
- **Filters Applied**: `filter` - Track filter usage and results
- **Navigation**: `navigate` - Track user flow between sections
- **AI Usage**: `use_odds_assistant` - Track AI odds assistant usage
- **Live Match Interactions**: `live_match_interaction` - Stream clicks, refreshes

#### Performance Monitoring

- **API Performance**: `timing_complete` - Track API response times
- **Error Tracking**: `exception` - Track and monitor errors

## 🔧 Advanced Configuration

### Custom Event Tracking

You can track custom events using the analytics utilities:

```typescript
import { trackEvent, trackMatchView } from '@/lib/analytics'

// Generic event tracking
trackEvent('custom_action', 'user_engagement', 'button_click', 1)

// Esports-specific tracking
trackMatchView('match_123', ['Team A', 'Team B'])
```

### Enhanced E-commerce Tracking

For future monetization features, you can extend the tracking:

```typescript
// Example: Track premium feature usage
trackEvent('premium_feature', 'subscription', 'advanced_analytics', 1)
```

## 📈 Viewing Your Analytics

### Real-Time Data

1. Go to **Reports** → **Realtime** in GA4
2. See current active users and page views
3. Monitor live events and user interactions

### Standard Reports

- **Life Cycle** → **Acquisition**: How users find your site
- **Life Cycle** → **Engagement**: User behavior and popular content
- **User** → **Demographics**: User characteristics and interests
- **User** → **Technology**: Browser and device information

### Custom Reports

Create custom reports for esports-specific metrics:

1. Go to **Explore** in GA4
2. Create a new exploration
3. Add dimensions: `Event name`, `Page title`, `Custom event parameters`
4. Add metrics: `Event count`, `Users`, `Sessions`

## 🎮 Esports-Specific Insights

### Popular Tournaments

Track which tournaments get the most views:
- **Event name**: `view_tournament`
- **Event parameter**: Tournament names and IDs

### Team Popularity

Monitor which teams are most popular:
- **Event name**: `view_team`
- **Event parameter**: Team names and view sources

### Match Engagement

Analyze match viewing patterns:
- **Event name**: `view_match`
- **Event parameter**: Match details and team matchups

### AI Feature Usage

Track AI odds assistant adoption:
- **Event name**: `use_odds_assistant`
- **Frequency**: How often users engage with AI features

## 🔒 Privacy and GDPR Compliance

### Data Protection

The integration is configured with privacy in mind:

- **Anonymized IPs**: IP anonymization is enabled by default in GA4
- **No Personal Data**: No personally identifiable information is tracked
- **Cookie Consent**: Consider adding a cookie consent banner for GDPR compliance

### GDPR Compliance

For EU users, consider implementing:

1. **Cookie Consent Banner**: Ask for analytics consent
2. **Privacy Policy**: Include GA4 data collection information
3. **Data Retention**: Configure data retention settings in GA4

### Example Cookie Consent Integration

```typescript
// Example: Conditional analytics loading
const [cookieConsent, setCookieConsent] = useState(false)

return (
  <>
    {cookieConsent && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    )}
    {/* Cookie consent banner */}
  </>
)
```

## 🚫 Troubleshooting

### Common Issues

#### Analytics Not Working

1. **Check Measurement ID**: Ensure it starts with `G-` and is correct
2. **Environment Variables**: Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
3. **Browser Console**: Check for JavaScript errors
4. **Ad Blockers**: Some ad blockers prevent analytics loading

#### Events Not Appearing

1. **Real-Time Reports**: Check if events appear in real-time view
2. **Event Names**: Ensure event names follow GA4 naming conventions
3. **Debug Mode**: Use GA4 DebugView for detailed event tracking

#### Development vs Production

- Analytics work in both development and production
- Use different GA4 properties for staging and production environments
- Test thoroughly before deploying to production

### Debug Mode

Enable debug mode for detailed event tracking:

```typescript
// Add to your GoogleAnalytics component
gtag('config', measurementId, {
  debug_mode: process.env.NODE_ENV === 'development'
})
```

## 📝 Best Practices

### Event Naming

- Use clear, descriptive event names
- Follow GA4 naming conventions (lowercase, underscores)
- Be consistent across similar events

### Data Organization

- Use event categories to group related events
- Include relevant context in event labels
- Set meaningful values for quantitative events

### Performance

- Track only meaningful events to avoid data overflow
- Use sampling for high-frequency events if needed
- Monitor quota usage in GA4

## 🔄 Updating and Maintenance

### Regular Tasks

1. **Review Reports**: Weekly analysis of key metrics
2. **Clean Data**: Remove test traffic and internal users
3. **Update Goals**: Adjust conversion goals as needed
4. **Monitor Quotas**: Ensure you stay within GA4 limits

### Future Enhancements

Consider implementing:

- **Custom Dimensions**: Add esports-specific user properties
- **Conversion Tracking**: Track key user actions as conversions
- **Audience Segments**: Create user segments for different interests
- **Integration**: Connect with other tools like Search Console

## 📞 Support

### Google Analytics Support

- [GA4 Help Center](https://support.google.com/analytics)
- [GA4 Academy](https://skillshop.exceedlms.com/student/catalog/list?category_ids=2844)
- [GA4 Community](https://www.en.advertisercommunity.com/t5/Google-Analytics/ct-p/Google_Analytics)

### Application-Specific Issues

For issues specific to the Esports Tracker analytics implementation:

1. Check the browser console for errors
2. Verify environment variables are correctly set
3. Test in both development and production environments
4. Review the analytics utility functions in `/app/lib/analytics.ts`

---

🎯 **Your Esports Tracker now has comprehensive analytics tracking! Monitor user engagement and optimize the experience based on real user data.** 
