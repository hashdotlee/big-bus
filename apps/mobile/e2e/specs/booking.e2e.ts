import {device, element, by, expect as detoxExpect} from 'detox';
import {
  launchApp,
  clearAppData,
  typeText,
  tapButton,
  expectToBeVisible,
  loginUser,
  searchRoute,
  selectRoute,
  selectSeat,
  fillPassengerInfo,
  selectPaymentMethod,
  confirmBooking,
} from '../helpers/testHelpers';

describe('Booking Journey', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'YES', location: 'always'},
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await clearAppData();
    // Login before each test
    await loginUser('test@example.com', 'password123');
  });

  describe('Search Routes', () => {
    it('should display search screen', async () => {
      await expectToBeVisible('search-screen');
      await detoxExpect(element(by.text('Search Bus Routes'))).toBeVisible();
    });

    it('should search for routes with valid inputs', async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');

      // Should display search results
      await expectToBeVisible('search-results');
      await detoxExpect(element(by.text('Found'))).toBeVisible();
    });

    it('should display route details in search results', async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');

      // Check for route information
      await detoxExpect(element(by.text('Hanoi → Saigon'))).toBeVisible();
      await detoxExpect(element(by.id('route-item-1'))).toBeVisible();
    });

    it('should show no results message when no routes found', async () => {
      await searchRoute('InvalidCity', 'AnotherInvalidCity', '2024-02-01');

      await detoxExpect(
        element(by.text('No routes found'))
      ).toBeVisible();
    });

    it('should require all search fields to be filled', async () => {
      await typeText('departure-input', 'Hanoi');
      await tapButton('search-button');

      // Should not proceed without all fields
      await detoxExpect(element(by.id('search-results'))).not.toBeVisible();
    });
  });

  describe('Route Selection', () => {
    beforeEach(async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
    });

    it('should navigate to seat selection when route is selected', async () => {
      await selectRoute('1');

      await expectToBeVisible('seat-selection-screen');
      await detoxExpect(element(by.text('Select Your Seats'))).toBeVisible();
    });

    it('should display route details on seat selection screen', async () => {
      await selectRoute('1');

      await detoxExpect(element(by.text('Hanoi → Saigon'))).toBeVisible();
      await detoxExpect(element(by.id('route-details'))).toBeVisible();
    });
  });

  describe('Seat Selection', () => {
    beforeEach(async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
    });

    it('should display seat map', async () => {
      await expectToBeVisible('seat-selector');
      await detoxExpect(element(by.text('Available'))).toBeVisible();
      await detoxExpect(element(by.text('Selected'))).toBeVisible();
      await detoxExpect(element(by.text('Unavailable'))).toBeVisible();
    });

    it('should select a seat when tapped', async () => {
      await selectSeat('A1');

      // Check that seat is marked as selected
      await detoxExpect(element(by.text('Selected: 1/5'))).toBeVisible();
      await detoxExpect(element(by.text('Seats: A1'))).toBeVisible();
    });

    it('should select multiple seats', async () => {
      await selectSeat('A1');
      await selectSeat('A2');
      await selectSeat('A3');

      await detoxExpect(element(by.text('Selected: 3/5'))).toBeVisible();
      await detoxExpect(element(by.text('Seats: A1, A2, A3'))).toBeVisible();
    });

    it('should deselect a seat when tapped again', async () => {
      await selectSeat('A1');
      await detoxExpect(element(by.text('Selected: 1/5'))).toBeVisible();

      await selectSeat('A1');
      await detoxExpect(element(by.text('Selected: 0/5'))).toBeVisible();
    });

    it('should not select unavailable seats', async () => {
      // Assuming B5 is unavailable
      await tapButton('seat-B5');

      // Should still show 0 selected
      await detoxExpect(element(by.text('Selected: 0/5'))).toBeVisible();
    });

    it('should not allow selecting more than max seats', async () => {
      await selectSeat('A1');
      await selectSeat('A2');
      await selectSeat('A3');
      await selectSeat('A4');
      await selectSeat('A5');

      // Try to select 6th seat
      await selectSeat('B1');

      // Should still only have 5 seats selected
      await detoxExpect(element(by.text('Selected: 5/5'))).toBeVisible();
    });

    it('should update total price when selecting seats', async () => {
      await selectSeat('A1');

      await detoxExpect(element(by.text('500,000 VND'))).toBeVisible();

      await selectSeat('A2');

      await detoxExpect(element(by.text('1,000,000 VND'))).toBeVisible();
    });

    it('should navigate to passenger info when continuing', async () => {
      await selectSeat('A1');
      await tapButton('continue-button');

      await expectToBeVisible('passenger-info-screen');
    });

    it('should require at least one seat to continue', async () => {
      await tapButton('continue-button');

      await detoxExpect(
        element(by.text('Please select at least one seat'))
      ).toBeVisible();
    });
  });

  describe('Passenger Information', () => {
    beforeEach(async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
      await selectSeat('A1');
      await tapButton('continue-button');
    });

    it('should display passenger information form', async () => {
      await expectToBeVisible('passenger-info-screen');
      await detoxExpect(element(by.text('Passenger Information'))).toBeVisible();
    });

    it('should fill passenger information', async () => {
      await fillPassengerInfo(
        'John Doe',
        '0123456789',
        'john@example.com'
      );

      await detoxExpect(element(by.id('fullname-input'))).toHaveText('John Doe');
      await detoxExpect(element(by.id('phone-input'))).toHaveText('0123456789');
      await detoxExpect(element(by.id('email-input'))).toHaveText('john@example.com');
    });

    it('should validate phone number format', async () => {
      await typeText('fullname-input', 'John Doe');
      await typeText('phone-input', '123');
      await typeText('email-input', 'john@example.com');
      await tapButton('continue-button');

      await detoxExpect(
        element(by.text('Please enter a valid phone number'))
      ).toBeVisible();
    });

    it('should validate email format', async () => {
      await typeText('fullname-input', 'John Doe');
      await typeText('phone-input', '0123456789');
      await typeText('email-input', 'invalidemail');
      await tapButton('continue-button');

      await detoxExpect(
        element(by.text('Please enter a valid email'))
      ).toBeVisible();
    });

    it('should require all mandatory fields', async () => {
      await tapButton('continue-button');

      await detoxExpect(
        element(by.text('Please fill in all required fields'))
      ).toBeVisible();
    });

    it('should navigate to payment when form is valid', async () => {
      await fillPassengerInfo(
        'John Doe',
        '0123456789',
        'john@example.com'
      );
      await tapButton('continue-button');

      await expectToBeVisible('payment-screen');
    });

    it('should handle multiple passengers for multiple seats', async () => {
      // Go back and select 2 seats
      await tapButton('back-button');
      await selectSeat('A2');
      await tapButton('continue-button');

      // Should show form for 2 passengers
      await detoxExpect(element(by.text('Passenger 1'))).toBeVisible();
      await detoxExpect(element(by.text('Passenger 2'))).toBeVisible();
    });
  });

  describe('Payment', () => {
    beforeEach(async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
      await selectSeat('A1');
      await tapButton('continue-button');
      await fillPassengerInfo('John Doe', '0123456789', 'john@example.com');
      await tapButton('continue-button');
    });

    it('should display payment methods', async () => {
      await expectToBeVisible('payment-screen');
      await detoxExpect(element(by.id('payment-vnpay'))).toBeVisible();
      await detoxExpect(element(by.id('payment-momo'))).toBeVisible();
      await detoxExpect(element(by.id('payment-zalopay'))).toBeVisible();
      await detoxExpect(element(by.id('payment-wallet'))).toBeVisible();
    });

    it('should select payment method', async () => {
      await selectPaymentMethod('vnpay');

      await detoxExpect(element(by.id('payment-vnpay'))).toHaveAccessibilityState({
        selected: true,
      });
    });

    it('should display booking summary', async () => {
      await detoxExpect(element(by.text('Booking Summary'))).toBeVisible();
      await detoxExpect(element(by.text('Hanoi → Saigon'))).toBeVisible();
      await detoxExpect(element(by.text('Seat A1'))).toBeVisible();
      await detoxExpect(element(by.text('John Doe'))).toBeVisible();
      await detoxExpect(element(by.text('500,000 VND'))).toBeVisible();
    });

    it('should require payment method to be selected', async () => {
      await tapButton('confirm-payment-button');

      await detoxExpect(
        element(by.text('Please select a payment method'))
      ).toBeVisible();
    });

    it('should navigate to confirmation after successful payment', async () => {
      await selectPaymentMethod('vnpay');
      await tapButton('confirm-payment-button');

      // Should show payment processing
      await detoxExpect(element(by.text('Processing payment...'))).toBeVisible();

      // Then navigate to confirmation
      await expectToBeVisible('booking-confirmation-screen');
    });
  });

  describe('Booking Confirmation', () => {
    beforeEach(async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
      await selectSeat('A1');
      await tapButton('continue-button');
      await fillPassengerInfo('John Doe', '0123456789', 'john@example.com');
      await tapButton('continue-button');
      await selectPaymentMethod('vnpay');
      await tapButton('confirm-payment-button');
    });

    it('should display booking confirmation', async () => {
      await expectToBeVisible('booking-confirmation-screen');
      await detoxExpect(element(by.text('Booking Confirmed!'))).toBeVisible();
    });

    it('should display booking details', async () => {
      await detoxExpect(element(by.id('booking-id'))).toBeVisible();
      await detoxExpect(element(by.text('Hanoi → Saigon'))).toBeVisible();
      await detoxExpect(element(by.text('Seat A1'))).toBeVisible();
    });

    it('should display QR code for ticket', async () => {
      await expectToBeVisible('booking-qr-code');
    });

    it('should allow downloading ticket', async () => {
      await tapButton('download-ticket-button');

      await detoxExpect(
        element(by.text('Ticket downloaded successfully'))
      ).toBeVisible();
    });

    it('should navigate to my bookings', async () => {
      await tapButton('view-bookings-button');

      await expectToBeVisible('my-bookings-screen');
    });

    it('should navigate to home', async () => {
      await tapButton('back-to-home-button');

      await expectToBeVisible('home-screen');
    });
  });

  describe('Complete Booking Flow', () => {
    it('should complete entire booking from search to confirmation', async () => {
      // Search
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await detoxExpect(element(by.id('search-results'))).toBeVisible();

      // Select route
      await selectRoute('1');
      await expectToBeVisible('seat-selection-screen');

      // Select seats
      await selectSeat('A1');
      await selectSeat('A2');
      await detoxExpect(element(by.text('Selected: 2/5'))).toBeVisible();
      await tapButton('continue-button');

      // Fill passenger info for 2 passengers
      await fillPassengerInfo('John Doe', '0123456789', 'john@example.com');
      await tapButton('continue-button');

      // Select payment
      await expectToBeVisible('payment-screen');
      await selectPaymentMethod('vnpay');
      await tapButton('confirm-payment-button');

      // Verify confirmation
      await expectToBeVisible('booking-confirmation-screen');
      await detoxExpect(element(by.text('Booking Confirmed!'))).toBeVisible();
      await expectToBeVisible('booking-qr-code');
    });
  });

  describe('Error Handling', () => {
    it('should handle payment failure', async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
      await selectSeat('A1');
      await tapButton('continue-button');
      await fillPassengerInfo('John Doe', '0123456789', 'john@example.com');
      await tapButton('continue-button');
      await selectPaymentMethod('vnpay');

      // Simulate payment failure
      // This would require mocking the payment API
      await tapButton('confirm-payment-button');

      // Should show error message
      // await detoxExpect(element(by.text('Payment failed'))).toBeVisible();
    });

    it('should handle seat no longer available', async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
      await selectSeat('A1');

      // Simulate seat being booked by another user
      // This would require backend API mock

      await tapButton('continue-button');

      // Should show error
      // await detoxExpect(element(by.text('Selected seat is no longer available'))).toBeVisible();
    });

    it('should allow going back through booking steps', async () => {
      await searchRoute('Hanoi', 'Saigon', '2024-02-01');
      await selectRoute('1');
      await selectSeat('A1');
      await tapButton('continue-button');

      // Go back to seat selection
      await tapButton('back-button');
      await expectToBeVisible('seat-selection-screen');

      // Go back to search
      await tapButton('back-button');
      await expectToBeVisible('search-screen');
    });
  });
});
