# Bus Booking System - UI/UX Design Document (Part 2)

## 14. Progressive Web App (PWA) Configuration

### 14.1 Manifest Configuration
```json
{
  "name": "VietBus - Đặt Vé Xe Khách",
  "short_name": "VietBus",
  "description": "Hệ thống đặt vé xe khách trực tuyến",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0066CC",
  "background_color": "#FFFFFF",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Book Ticket",
      "short_name": "Book",
      "description": "Book a new bus ticket",
      "url": "/booking/new",
      "icons": [{ "src": "/icons/book.png", "sizes": "192x192" }]
    },
    {
      "name": "My Tickets",
      "short_name": "Tickets",
      "description": "View your tickets",
      "url": "/tickets",
      "icons": [{ "src": "/icons/ticket.png", "sizes": "192x192" }]
    }
  ]
}
```

### 14.2 Service Worker Implementation
```javascript
// sw.js - Service Worker for offline support
const CACHE_NAME = 'vietbus-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/icons/logo.svg'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            return caches.match('/offline.html');
          });
      })
  );
});

// Background sync for offline bookings
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncOfflineBookings());
  }
});

async function syncOfflineBookings() {
  const db = await openDB('BookingDB', 1);
  const tx = db.transaction('pending_bookings', 'readonly');
  const bookings = await tx.objectStore('pending_bookings').getAll();
  
  for (const booking of bookings) {
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      // Remove from pending after successful sync
      await db.delete('pending_bookings', booking.id);
    } catch (error) {
      console.error('Failed to sync booking:', error);
    }
  }
}
```

## 15. Admin Dashboard Components

### 15.1 Analytics Dashboard
```tsx
// Dashboard metrics component
const DashboardMetrics = () => {
  const metrics = useDashboardData();
  
  return (
    <div className="metrics-grid">
      <MetricCard
        title="Today's Revenue"
        value={metrics.todayRevenue}
        change={metrics.revenueChange}
        icon={<DollarIcon />}
        color="green"
        format="currency"
      />
      <MetricCard
        title="Active Bookings"
        value={metrics.activeBookings}
        change={metrics.bookingChange}
        icon={<TicketIcon />}
        color="blue"
      />
      <MetricCard
        title="Occupancy Rate"
        value={metrics.occupancyRate}
        change={metrics.occupancyChange}
        icon={<ChartIcon />}
        color="purple"
        format="percentage"
      />
      <MetricCard
        title="Active Vehicles"
        value={metrics.activeVehicles}
        total={metrics.totalVehicles}
        icon={<BusIcon />}
        color="orange"
      />
    </div>
  );
};

// Revenue chart component
const RevenueChart = ({ period = 'week' }) => {
  const data = useRevenueData(period);
  
  return (
    <Card className="revenue-chart">
      <CardHeader>
        <h3>Revenue Overview</h3>
        <PeriodSelector value={period} onChange={setPeriod} />
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={formatCurrency} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0066CC" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="#FF6B35" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
```

### 15.2 Route Management Interface
```tsx
const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  return (
    <div className="route-management">
      <div className="route-map">
        <MapContainer center={[10.8231, 106.6297]} zoom={7}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routes.map(route => (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              color={route.isActive ? '#0066CC' : '#999999'}
              weight={3}
              opacity={0.7}
            >
              <Popup>
                <div>
                  <h4>{route.name}</h4>
                  <p>Distance: {route.distance}km</p>
                  <p>Duration: {route.duration}</p>
                  <p>Active Trips: {route.activeTrips}</p>
                </div>
              </Popup>
            </Polyline>
          ))}
          {/* Station markers */}
          {stations.map(station => (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={stationIcon}
            >
              <Tooltip>{station.name}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="route-details">
        <RouteForm
          route={selectedRoute}
          onSave={handleSaveRoute}
          onDelete={handleDeleteRoute}
        />
        
        <ScheduleBuilder
          route={selectedRoute}
          vehicles={availableVehicles}
          drivers={availableDrivers}
          onScheduleCreate={handleCreateSchedule}
        />
      </div>
    </div>
  );
};
```

### 15.3 Real-time Vehicle Tracking
```tsx
const VehicleTracking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('wss://api.vietbus.com/tracking');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setVehicles(prev => 
        prev.map(v => v.id === update.vehicleId 
          ? { ...v, location: update.location, speed: update.speed }
          : v
        )
      );
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="vehicle-tracking">
      <div className="tracking-sidebar">
        <VehicleList
          vehicles={vehicles}
          selectedId={selectedVehicle?.id}
          onSelect={setSelectedVehicle}
        />
        
        {selectedVehicle && (
          <VehicleDetails
            vehicle={selectedVehicle}
            onCall={() => callDriver(selectedVehicle.driverId)}
            onMessage={() => messageDriver(selectedVehicle.driverId)}
          />
        )}
      </div>
      
      <div className="tracking-map">
        <GoogleMap
          center={selectedVehicle?.location || defaultCenter}
          zoom={selectedVehicle ? 14 : 10}
        >
          {vehicles.map(vehicle => (
            <VehicleMarker
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => setSelectedVehicle(vehicle)}
            />
          ))}
          
          {selectedVehicle && (
            <RouteOverlay
              route={selectedVehicle.route}
              progress={selectedVehicle.progress}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};
```

## 16. Customer Support Interface

### 16.1 Help Center & Chatbot
```tsx
const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <div className="help-center">
      <div className="help-categories">
        <CategoryCard
          icon={<BookingIcon />}
          title="Booking Help"
          topics={[
            'How to book a ticket',
            'Changing your booking',
            'Cancellation policy'
          ]}
          onClick={() => setActiveCategory('booking')}
        />
        <CategoryCard
          icon={<PaymentIcon />}
          title="Payment Issues"
          topics={[
            'Payment methods',
            'Refund process',
            'Invoice requests'
          ]}
          onClick={() => setActiveCategory('payment')}
        />
        <CategoryCard
          icon={<AccountIcon />}
          title="Account"
          topics={[
            'Reset password',
            'Update profile',
            'Loyalty program'
          ]}
          onClick={() => setActiveCategory('account')}
        />
      </div>
      
      <FAQSection category={activeCategory} />
      
      <FloatingActionButton
        icon={<ChatIcon />}
        onClick={() => setShowChatbot(true)}
        label="Chat with us"
      />
      
      {showChatbot && (
        <Chatbot
          onClose={() => setShowChatbot(false)}
          initialMessage="Xin chào! Tôi có thể giúp gì cho bạn?"
          quickReplies={[
            'Check booking status',
            'Cancel booking',
            'Speak to agent'
          ]}
        />
      )}
    </div>
  );
};

// Chatbot component with AI responses
const Chatbot = ({ onClose, initialMessage, quickReplies }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I couldn\'t process that. Please try again.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <Avatar src="/icons/bot-avatar.png" />
        <span>VietBus Assistant</span>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <Message
            key={index}
            type={msg.type}
            text={msg.text}
            timestamp={msg.timestamp}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      
      <div className="chatbot-quick-replies">
        {quickReplies.map(reply => (
          <Chip
            key={reply}
            label={reply}
            onClick={() => setInput(reply)}
          />
        ))}
      </div>
      
      <div className="chatbot-input">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <IconButton onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
};
```

## 17. Mobile App Specific Features

### 17.1 React Native Components
```tsx
// Main Navigation Structure
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BookingStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Schedules" component={ScheduleListScreen} />
    <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
    <Stack.Screen name="PassengerInfo" component={PassengerInfoScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
  </Stack.Navigator>
);

const MainApp = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: HomeIcon,
            Booking: TicketIcon,
            Tickets: ListIcon,
            Notifications: BellIcon,
            Profile: UserIcon
          };
          const Icon = icons[route.name];
          return <Icon color={color} size={size} focused={focused} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Booking" component={BookingStack} />
      <Tab.Screen name="Tickets" component={MyTicketsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </NavigationContainer>
);

// Native-specific seat selection with haptic feedback
import { Vibration } from 'react-native';

const SeatButton = ({ seat, onPress, isSelected, isOccupied }) => {
  const handlePress = () => {
    if (!isOccupied) {
      Vibration.vibrate(10); // Haptic feedback
      onPress(seat.id);
    }
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isOccupied}
      style={[
        styles.seat,
        isSelected && styles.seatSelected,
        isOccupied && styles.seatOccupied
      ]}
    >
      <Text style={styles.seatNumber}>{seat.number}</Text>
    </TouchableOpacity>
  );
};

// Biometric authentication
import TouchID from 'react-native-touch-id';
import FaceID from 'react-native-face-id';

const BiometricLogin = () => {
  const authenticate = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      
      if (biometryType === 'FaceID') {
        await FaceID.authenticate('Login to VietBus');
      } else if (biometryType === 'TouchID') {
        await TouchID.authenticate('Login to VietBus');
      }
      
      // Proceed with login
      navigateToHome();
    } catch (error) {
      // Fall back to password login
      showPasswordLogin();
    }
  };
  
  return (
    <View style={styles.biometricContainer}>
      <TouchableOpacity onPress={authenticate}>
        <Icon name="fingerprint" size={64} color="#0066CC" />
        <Text>Tap to login with biometrics</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 17.2 Offline Capability
```typescript
// Offline data sync for React Native
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineManager {
  constructor() {
    this.queue = [];
    this.isOnline = true;
    
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.syncQueue();
      }
    });
  }
  
  async saveBooking(bookingData) {
    if (this.isOnline) {
      return await api.createBooking(bookingData);
    } else {
      // Save to local queue
      const booking = {
        ...bookingData,
        id: `offline_${Date.now()}`,
        status: 'pending_sync'
      };
      
      this.queue.push(booking);
      await AsyncStorage.setItem(
        '@offline_bookings',
        JSON.stringify(this.queue)
      );
      
      return booking;
    }
  }
  
  async syncQueue() {
    const offlineBookings = await AsyncStorage.getItem('@offline_bookings');
    if (offlineBookings) {
      this.queue = JSON.parse(offlineBookings);
      
      for (const booking of this.queue) {
        try {
          const result = await api.createBooking(booking);
          // Update local booking with server response
          await this.updateLocalBooking(booking.id, result);
        } catch (error) {
          console.error('Failed to sync booking:', error);
        }
      }
      
      // Clear synced items
      this.queue = [];
      await AsyncStorage.removeItem('@offline_bookings');
    }
  }
}
```

## 18. Print Layouts

### 18.1 E-Ticket Print Template
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      
      body {
        margin: 0;
        font-family: Arial, sans-serif;
      }
      
      .no-print {
        display: none;
      }
      
      .ticket-container {
        padding: 20mm;
        background: white;
      }
      
      .ticket-header {
        border-bottom: 2px dashed #333;
        padding-bottom: 10mm;
        margin-bottom: 10mm;
      }
      
      .company-logo {
        width: 150px;
        height: auto;
      }
      
      .ticket-title {
        font-size: 24pt;
        font-weight: bold;
        color: #0066CC;
        margin: 10mm 0;
      }
      
      .booking-code {
        font-size: 18pt;
        font-weight: bold;
        background: #f0f0f0;
        padding: 5mm;
        text-align: center;
        margin: 10mm 0;
      }
      
      .qr-code {
        width: 100mm;
        height: 100mm;
        margin: 0 auto;
        display: block;
      }
      
      .ticket-details {
        margin-top: 10mm;
      }
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 3mm 0;
        border-bottom: 1px solid #eee;
      }
      
      .detail-label {
        font-weight: bold;
        color: #666;
      }
      
      .detail-value {
        text-align: right;
      }
      
      .important-info {
        background: #fff3cd;
        border: 1px solid #ffc107;
        padding: 5mm;
        margin-top: 10mm;
      }
      
      .terms {
        font-size: 8pt;
        color: #666;
        margin-top: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <img src="/logo.png" alt="VietBus" class="company-logo">
      <h1 class="ticket-title">E-TICKET / VÉ ĐIỆN TỬ</h1>
    </div>
    
    <div class="booking-code">
      Booking Code: {{bookingCode}}
    </div>
    
    <img src="{{qrCodeUrl}}" alt="QR Code" class="qr-code">
    
    <div class="ticket-details">
      <div class="detail-row">
        <span class="detail-label">Passenger Name:</span>
        <span class="detail-value">{{passengerName}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Route:</span>
        <span class="detail-value">{{origin}} → {{destination}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">{{departureDate}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Departure Time:</span>
        <span class="detail-value">{{departureTime}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Seat Number:</span>
        <span class="detail-value">{{seatNumbers}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Pickup Point:</span>
        <span class="detail-value">{{pickupLocation}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Vehicle:</span>
        <span class="detail-value">{{vehicleType}} - {{licensePlate}}</span>
      </div>
    </div>
    
    <div class="important-info">
      <strong>Important:</strong>
      <ul>
        <li>Please arrive 15 minutes before departure</li>
        <li>Bring a valid ID for verification</li>
        <li>This ticket is non-transferable</li>
      </ul>
    </div>
    
    <div class="terms">
      <p>Terms & Conditions apply. Visit www.vietbus.com/terms for details.</p>
      <p>Customer Support: 1900-xxxx | support@vietbus.com</p>
    </div>
  </div>
  
  <button class="no-print" onclick="window.print()">
    Print Ticket
  </button>
</body>
</html>
```

## 19. Performance Metrics & Monitoring

### 19.1 Performance Budget
```javascript
// Performance budget configuration
const performanceBudget = {
  // Time metrics
  timeToInteractive: 3000, // 3 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  largestContentfulPaint: 2500, // 2.5 seconds
  
  // Size metrics
  bundleSize: {
    js: 200 * 1024, // 200KB
    css: 50 * 1024, // 50KB
    images: 500 * 1024, // 500KB per page
    total: 1024 * 1024 // 1MB total
  },
  
  // Core Web Vitals
  coreWebVitals: {
    LCP: 2500, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1 // Cumulative Layout Shift
  }
};

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Send metrics to analytics
    analytics.track('performance', {
      name: entry.name,
      value: entry.startTime,
      metric: entry.entryType
    });
    
    // Check against budget
    if (entry.name === 'first-contentful-paint') {
      if (entry.startTime > performanceBudget.firstContentfulPaint) {
        console.warn('FCP exceeded budget:', entry.startTime);
      }
    }
  }
});

performanceObserver.observe({ 
  entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] 
});
```

### 19.2 Analytics Integration
```typescript
// Google Analytics 4 + Custom Analytics
class Analytics {
  constructor() {
    this.gtag = window.gtag;
    this.customEndpoint = '/api/analytics';
  }
  
  // Track page views
  trackPageView(page: string, additionalData?: any) {
    // GA4
    this.gtag('event', 'page_view', {
      page_path: page,
      ...additionalData
    });
    
    // Custom analytics
    this.sendToCustom({
      event: 'pageview',
      page,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }
  
  // Track booking funnel
  trackBookingStep(step: string, data: any) {
    const stepMapping = {
      search: 1,
      schedule_select: 2,
      seat_select: 3,
      passenger_info: 4,
      payment: 5,
      confirmation: 6
    };
    
    // GA4 Enhanced Ecommerce
    this.gtag('event', 'view_item_list', {
      currency: 'VND',
      value: data.totalPrice,
      items: [{
        item_id: data.scheduleId,
        item_name: data.routeName,
        price: data.price,
        quantity: data.seatCount
      }]
    });
    
    // Custom funnel tracking
    this.sendToCustom({
      event: 'booking_funnel',
      step: stepMapping[step],
      step_name: step,
      ...data
    });
  }
  
  // Track errors
  trackError(error: Error, context?: any) {
    this.gtag('event', 'exception', {
      description: error.message,
      fatal: false
    });
    
    // Send to error monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        extra: context
      });
    }
  }
  
  private async sendToCustom(data: any) {
    try {
      await fetch(this.customEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}
```

## 20. Design Handoff & Documentation

### 20.1 Design Tokens
```json
{
  "colors": {
    "primary": {
      "50": "#E6F1FF",
      "100": "#BAD9FF",
      "200": "#8DC1FF",
      "300": "#61A9FF",
      "400": "#3591FF",
      "500": "#0066CC",
      "600": "#0052A3",
      "700": "#003D7A",
      "800": "#002952",
      "900": "#001429"
    },
    "semantic": {
      "success": "#00A86B",
      "warning": "#F39C12",
      "error": "#E74C3C",
      "info": "#3498DB"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 3px rgba(0,0,0,0.12)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 20px rgba(0,0,0,0.15)",
    "xl": "0 20px 40px rgba(0,0,0,0.2)"
  },
  "transitions": {
    "fast": "150ms ease-in-out",
    "base": "250ms ease-in-out",
    "slow": "350ms ease-in-out"
  }
}
```

### 20.2 Component Documentation Template
```markdown
# Component: SearchWidget

## Description
Search widget for finding bus routes with origin, destination, date, and passenger count.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| defaultOrigin | string | null | Pre-selected origin station |
| defaultDestination | string | null | Pre-selected destination station |
| defaultDate | Date | today | Pre-selected departure date |
| onSearch | function | required | Callback when search is triggered |
| onSwap | function | null | Callback when swap button is clicked |

## States
- `loading`: Boolean - Shows loading state
- `error`: String - Error message if search fails
- `results`: Array - Search results

## Events
- `onSearch`: Fired when user clicks search button
- `onClear`: Fired when user clears the form
- `onSwapLocations`: Fired when swap button is clicked

## Accessibility
- Fully keyboard navigable
- ARIA labels for all interactive elements
- Screen reader announcements for state changes

## Usage Example
```jsx
<SearchWidget
  defaultOrigin="Ho Chi Minh"
  defaultDestination="Da Lat"
  onSearch={handleSearch}
  onSwap={handleSwap}
/>
```

## Design Specifications
- Mobile: Full width, stacked layout
- Tablet: 2-column layout
- Desktop: Single row layout
- Colors: Primary blue for CTA, gray for inputs
- Spacing: 16px between elements
- Border radius: 8px for inputs, 12px for button
```

---

Đây là thiết kế toàn diện cho hệ thống đặt xe của anh, bao gồm:

1. **Database Schema** - Thiết kế CSDL PostgreSQL với 30+ bảng
2. **API Architecture** - Microservices với NestJS, 6 services riêng biệt
3. **UI/UX Design** - Flows, components, responsive design, PWA

Toàn bộ hệ thống được thiết kế với:
- **Scalability**: Microservices, horizontal scaling ready
- **Performance**: Caching, lazy loading, CDN ready
- **Security**: JWT, 2FA, rate limiting
- **UX**: Mobile-first, offline support, real-time tracking
- **Localization**: Đa ngôn ngữ (VI/EN)
- **Analytics**: Tích hợp tracking & monitoring

Anh có muốn tôi đi sâu vào phần nào cụ thể không? Ví dụ như implementation code cho một module cụ thể?
