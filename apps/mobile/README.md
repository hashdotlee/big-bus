# Big Bus Mobile App

React Native mobile application for the Big Bus booking system.

## Features

- 🔐 **Authentication**: Login, Register, Password Reset
- 🔍 **Booking Flow**: Search routes, select schedules, choose seats, payment
- 📱 **QR Code Tickets**: Digital tickets with QR codes
- 💳 **Multiple Payment Methods**: VNPay, Momo, ZaloPay, Cash
- 🔔 **Real-time Notifications**: WebSocket-based updates
- 📍 **Vehicle Tracking**: Track bus location in real-time
- 👤 **Profile Management**: Update profile, change password

## Prerequisites

- Node.js >= 18
- React Native development environment setup
  - For iOS: Xcode, CocoaPods
  - For Android: Android Studio, JDK
- Backend services running (see main README)

## Installation

```bash
# Install dependencies
cd apps/mobile
npm install

# iOS only: Install pods
cd ios && pod install && cd ..
```

## Configuration

1. Copy environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
API_URL=http://localhost:80
WS_URL=ws://localhost:80
# Add other API keys as needed
```

## Running

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/         # Screen components
│   ├── auth/        # Authentication screens
│   ├── booking/     # Booking flow screens
│   ├── home/        # Home screen
│   ├── bookings/    # My bookings screen
│   ├── profile/     # Profile screens
│   ├── tracking/    # Vehicle tracking
│   ├── notifications/ # Notifications
│   └── settings/    # Settings
├── navigation/      # Navigation setup
├── services/        # API and Socket services
├── store/          # Zustand state management
├── hooks/          # Custom React hooks
├── utils/          # Utilities and helpers
├── types/          # TypeScript types
└── assets/         # Images, fonts, etc.
```

## Tech Stack

- **Framework**: React Native 0.73
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **API Client**: Axios
- **WebSocket**: Socket.io Client
- **Storage**: AsyncStorage
- **UI**: React Native Vector Icons, QR Code
- **TypeScript**: Full type safety

## API Integration

The app connects to the Big Bus backend microservices:

- **Auth Service**: `/auth/*` - Authentication and user management
- **Booking Service**: `/booking/*` - Routes, schedules, bookings
- **Payment Service**: `/payment/*` - Payment processing
- **Vehicle Service**: `/vehicle/*` - Vehicle tracking
- **Notification Service**: `/notification/*` - Push notifications

## State Management

Uses Zustand for global state:

- `authStore`: User authentication and profile
- `bookingStore`: Booking flow and ticket management

## Development

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test
```

## Building

### Android

```bash
cd android
./gradlew assembleRelease
```

### iOS

```bash
cd ios
xcodebuild -workspace BigBus.xcworkspace -scheme BigBus -configuration Release
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android && ./gradlew clean
```

### iOS build issues
```bash
cd ios && pod deintegrate && pod install
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private - All rights reserved
