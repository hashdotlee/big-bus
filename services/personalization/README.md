# Personalization Service

Advanced personalization and recommendation engine for Big Bus platform, delivering tailored experiences while optimizing costs.

## Features

- **User Preferences Management**: Store and manage user preferences for routes, seats, amenities, products
- **Behavior Tracking**: Track user actions and engagement patterns
- **Smart Recommendations**: AI-powered recommendations for routes, products, deals
- **Dynamic Pricing**: Personalized pricing based on user segments and behavior
- **User Segmentation**: Automatic user segmentation (Bronze, Silver, Gold, Platinum)
- **Cost Optimization**: Smart routing and pricing to balance experience and costs

## Entities

### UserPreference
- Route, seat, and amenity preferences
- Favorite routes and products
- Notification and privacy settings
- Budget preferences and accessibility needs

### UserBehavior
- Event tracking (page views, searches, bookings, purchases)
- Context information (device, platform, location)
- Engagement metrics and conversion tracking

### Recommendation
- Route, product, deal, and upgrade recommendations
- Algorithm-based scoring (collaborative filtering, content-based, hybrid)
- Engagement tracking (impressions, clicks, conversions)
- Personalization factors and reasons

### UserSegment
- User tier (Bronze, Silver, Gold, Platinum)
- Lifecycle stage (New, Active, At-Risk, Churned)
- Spending and frequency tiers
- Engagement score and churn risk prediction

### PricingRule
- Dynamic and segment-based pricing strategies
- Time-based and demand-based rules
- Loyalty and promotional pricing
- Usage limits and performance tracking

## API Endpoints

### Preferences API

```bash
# Get user preferences
GET /api/v1/preferences/:userId

# Update preferences
PUT /api/v1/preferences/:userId
{
  "preferExpressRoutes": true,
  "prefersWifi": true,
  "budgetTier": "standard",
  "maxBudgetPerTrip": 50.00
}

# Add/Remove favorite routes
POST /api/v1/preferences/:userId/favorite-routes/:routeId
DELETE /api/v1/preferences/:userId/favorite-routes/:routeId

# Update notification settings
PUT /api/v1/preferences/:userId/notifications
{
  "enableEmailNotifications": true,
  "notifyOnDeals": true
}
```

### Behavior Tracking API

```bash
# Track user event
POST /api/v1/behavior/track
{
  "userId": "user_123",
  "eventType": "route_search",
  "entityType": "route",
  "entityId": "route_456",
  "device": "mobile",
  "platform": "ios"
}

# Get user behavior stats
GET /api/v1/behavior/:userId/stats?days=30

# Get user segment
GET /api/v1/behavior/:userId/segment
```

### Recommendations API

```bash
# Get personalized recommendations
GET /api/v1/recommendations?userId=user_123&type=route&limit=10

Response:
[
  {
    "id": "rec_123",
    "type": "route",
    "title": "Your Favorite Route",
    "description": "Book your favorite route again",
    "entityId": "route_456",
    "score": 0.95,
    "reasons": ["Based on your favorites"],
    "hasSpecialOffer": true,
    "discountPercentage": 15
  }
]

# Track recommendation interaction
POST /api/v1/recommendations/track
{
  "recommendationId": "rec_123",
  "action": "clicked" // viewed, clicked, converted, dismissed
}
```

### Dynamic Pricing API

```bash
# Get personalized price
POST /api/v1/pricing/calculate
{
  "userId": "user_123",
  "entityType": "route",
  "entityId": "route_456",
  "basePrice": 50.00,
  "date": "2025-01-20"
}

Response:
{
  "basePrice": 50.00,
  "adjustedPrice": 40.00,
  "discount": 10.00,
  "discountPercentage": 20,
  "appliedRules": [
    {
      "name": "Gold Member Discount",
      "adjustment": -10.00
    }
  ]
}
```

## User Segmentation

### Automatic Tier Assignment

- **Bronze**: 0-4 bookings or $0-$99 spent
- **Silver**: 5-9 bookings or $100-$249 spent
- **Gold**: 10-19 bookings or $250-$499 spent
- **Platinum**: 20+ bookings or $500+ spent

### Lifecycle Stages

- **New**: First-time users
- **Active**: Regular usage, recent bookings
- **At-Risk**: 30-60 days since last booking
- **Churned**: 60+ days inactive
- **Reactivated**: Returned after churn period

### Engagement Metrics

- **Engagement Score** (0-100): Activity level relative to tenure
- **Churn Risk** (0-1): Probability of user churning
- **Lifetime Value**: Total historical spend
- **Predicted LTV**: Estimated future value

## Personalization Strategies

### Route Recommendations

1. **Favorite-based**: Recommend frequently booked routes
2. **Preference-based**: Match route characteristics to preferences
3. **Collaborative**: "Users like you also booked..."
4. **Seasonal**: Time-sensitive route suggestions

### Product Recommendations

1. **View history**: Products user viewed multiple times
2. **Purchase history**: Repurchase suggestions
3. **Cross-sell**: Complementary products
4. **Category affinity**: Based on product category interests

### Dynamic Pricing

1. **Segment-based**: Discounts for loyal customers
2. **Demand-based**: Peak vs off-peak pricing
3. **Time-based**: Early bird or last-minute deals
4. **Inventory-based**: Pricing by seat availability

## Cost Optimization

### Smart Routing

- Recommend cost-effective routes matching preferences
- Balance scenic vs express routes based on budget
- Suggest alternative routes with better value

### Budget-Aware Pricing

- Respect user's maxBudgetPerTrip settings
- Offer budget-tier alternatives
- Highlight cost savings in recommendations

### Efficient Resource Allocation

- Target high-value users with premium offers
- Re-engagement campaigns for at-risk users
- Automated segmentation reduces manual work

## Integration Examples

### With Booking Service

```typescript
// Get personalized price before booking
const pricing = await personalizationService.getPersonalizedPrice({
  userId: user.id,
  entityType: 'route',
  entityId: route.id,
  basePrice: route.basePrice,
  date: bookingDate
});

// Track booking completion
await personalizationService.trackEvent({
  userId: user.id,
  eventType: 'booking_completed',
  entityType: 'route',
  entityId: route.id,
  value: pricing.adjustedPrice
});
```

### With Marketplace Service

```typescript
// Get product recommendations
const recommendations = await personalizationService.getRecommendations({
  userId: user.id,
  type: 'product',
  limit: 5,
  context: 'checkout'
});

// Track product view
await personalizationService.trackEvent({
  userId: user.id,
  eventType: 'product_view',
  entityType: 'product',
  entityId: product.id
});
```

## Environment Variables

```env
PORT=3010
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=personalization_db
```

## Running the Service

```bash
# Development
cd services/personalization
pnpm install
pnpm run dev

# Production
pnpm run build
pnpm run start:prod

# Docker
docker-compose up personalization-service
```

## Best Practices

1. **Privacy First**: Respect user privacy settings
2. **Transparent Pricing**: Clear explanation of discounts
3. **A/B Testing**: Test recommendation algorithms
4. **Performance Monitoring**: Track conversion rates
5. **Regular Updates**: Keep user segments current
6. **Ethical AI**: Avoid discriminatory pricing

## License

MIT
