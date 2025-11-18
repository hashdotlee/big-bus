# Big Bus Mobile App

React Native mobile application for the Big Bus booking system.

## Features

- User authentication (Email/Password, OAuth)
- Route search and booking
- Seat selection
- Payment integration (VNPay, Momo, ZaloPay)
- Real-time bus tracking
- Ticket management
- Push notifications

## Tech Stack

- **Framework**: React Native 0.73
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Navigation**: React Navigation
- **Testing**: Jest + Detox

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment setup
  - For iOS: Xcode, CocoaPods
  - For Android: Android Studio, JDK

### Installation

```bash
# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Testing

### Unit Tests

Unit tests are written using Jest and React Testing Library.

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Unit Test Structure

```
__tests__/
├── components/     # Component tests
├── screens/        # Screen tests
├── store/          # State management tests
├── hooks/          # Custom hooks tests
├── utils/          # Utility function tests
└── services/       # API service tests
```

### E2E Tests

End-to-end tests are written using Detox.

```bash
# Build the app for testing
npm run test:e2e:build:ios    # iOS
npm run test:e2e:build:android # Android

# Run E2E tests
npm run test:e2e:ios          # iOS
npm run test:e2e:android      # Android
```

### E2E Test Structure

```
e2e/
├── specs/          # Test specifications
│   ├── auth.e2e.ts       # Authentication tests
│   ├── booking.e2e.ts    # Booking flow tests
│   └── tickets.e2e.ts    # Ticket management tests
└── helpers/        # Test helper functions
    └── testHelpers.ts
```

### Coverage Requirements

- Minimum 70% coverage for branches, functions, lines, and statements
- All critical user flows must have E2E tests
- All components must have unit tests

### Writing Tests

#### Unit Test Example

```typescript
import {render, fireEvent} from '@testing-library/react-native';
import Button from '@components/Button';

describe('Button', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <Button title="Click Me" onPress={onPress} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

#### E2E Test Example

```typescript
import {expectToBeVisible, tapButton} from '../helpers/testHelpers';

describe('Login', () => {
  it('should login successfully', async () => {
    await expectToBeVisible('login-screen');
    await typeText('email-input', 'test@example.com');
    await typeText('password-input', 'password123');
    await tapButton('login-button');
    await expectToBeVisible('home-screen');
  });
});
```

### Test Best Practices

1. **Use testIDs**: Always add `testID` props to components for E2E tests
2. **Mock API calls**: Use Jest mocks for API calls in unit tests
3. **Isolate tests**: Each test should be independent
4. **Clean up**: Clear state between tests
5. **Descriptive names**: Use clear, descriptive test names
6. **Test user behavior**: Focus on user interactions, not implementation details

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── store/          # Zustand stores
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── services/       # API services
│   ├── constants/      # Constants
│   └── types/          # TypeScript types
├── __tests__/          # Unit tests
├── e2e/                # End-to-end tests
├── ios/                # iOS native code
├── android/            # Android native code
└── App.tsx             # Root component
```

## CI/CD

Tests are automatically run on:
- Pull requests
- Commits to main branch

### CI Pipeline

1. Install dependencies
2. Run linting
3. Run type checking
4. Run unit tests
5. Generate coverage report
6. Run E2E tests (on schedule)

## Code Quality

```bash
# Run linter
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

## Troubleshooting

### Tests failing on CI

- Ensure all dependencies are installed
- Check for environment-specific issues
- Verify mock data is consistent

### Detox tests failing

- Make sure emulator/simulator is running
- Rebuild the app for testing
- Check Detox configuration

### Coverage not meeting threshold

- Add tests for uncovered code
- Remove dead code
- Check coverage report: `npm run test:coverage`

## Contributing

1. Write tests for new features
2. Ensure all tests pass
3. Maintain coverage above 70%
4. Follow testing best practices

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [React Native Documentation](https://reactnative.dev/)
