import {device, element, by, expect as detoxExpect} from 'detox';
import {
  clearAppData,
  tapButton,
  expectToBeVisible,
  loginUser,
} from '../helpers/testHelpers';

describe('Ticket Management', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'YES', location: 'always'},
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await clearAppData();
    await loginUser('test@example.com', 'password123');
  });

  describe('My Bookings Screen', () => {
    it('should navigate to my bookings', async () => {
      await tapButton('bookings-tab');
      await expectToBeVisible('my-bookings-screen');
      await detoxExpect(element(by.text('My Bookings'))).toBeVisible();
    });

    it('should display list of bookings', async () => {
      await tapButton('bookings-tab');

      // Should show bookings list
      await expectToBeVisible('bookings-list');
    });

    it('should show empty state when no bookings', async () => {
      await tapButton('bookings-tab');

      // For new user with no bookings
      await detoxExpect(
        element(by.text('No bookings yet'))
      ).toBeVisible();
      await detoxExpect(
        element(by.text('Book your first trip now!'))
      ).toBeVisible();
    });

    it('should navigate to search from empty state', async () => {
      await tapButton('bookings-tab');
      await tapButton('book-now-button');

      await expectToBeVisible('search-screen');
    });
  });

  describe('Booking Details', () => {
    it('should display booking details when tapped', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      await expectToBeVisible('booking-details-screen');
      await detoxExpect(element(by.text('Booking Details'))).toBeVisible();
    });

    it('should show all booking information', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      // Verify all details are present
      await detoxExpect(element(by.id('booking-id'))).toBeVisible();
      await detoxExpect(element(by.id('route-info'))).toBeVisible();
      await detoxExpect(element(by.id('passenger-info'))).toBeVisible();
      await detoxExpect(element(by.id('seat-info'))).toBeVisible();
      await detoxExpect(element(by.id('payment-info'))).toBeVisible();
      await detoxExpect(element(by.id('booking-status'))).toBeVisible();
    });

    it('should display QR code for active bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      await expectToBeVisible('ticket-qr-code');
    });

    it('should allow downloading ticket', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('download-ticket-button');

      await detoxExpect(
        element(by.text('Ticket downloaded successfully'))
      ).toBeVisible();
    });

    it('should allow sharing ticket', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('share-ticket-button');

      // Native share dialog should appear
      // Note: Testing native dialogs with Detox is limited
    });
  });

  describe('Booking Filters', () => {
    it('should filter by upcoming bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('filter-upcoming');

      // Should show only upcoming bookings
      await detoxExpect(element(by.id('upcoming-bookings-list'))).toBeVisible();
    });

    it('should filter by past bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('filter-past');

      // Should show only past bookings
      await detoxExpect(element(by.id('past-bookings-list'))).toBeVisible();
    });

    it('should filter by cancelled bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('filter-cancelled');

      // Should show only cancelled bookings
      await detoxExpect(element(by.id('cancelled-bookings-list'))).toBeVisible();
    });

    it('should show all bookings by default', async () => {
      await tapButton('bookings-tab');

      await detoxExpect(element(by.id('all-bookings-list'))).toBeVisible();
    });
  });

  describe('Booking Status', () => {
    it('should display confirmed status for confirmed bookings', async () => {
      await tapButton('bookings-tab');

      await detoxExpect(
        element(by.id('booking-status-confirmed'))
      ).toBeVisible();
    });

    it('should display pending status for pending bookings', async () => {
      await tapButton('bookings-tab');

      await detoxExpect(
        element(by.id('booking-status-pending'))
      ).toBeVisible();
    });

    it('should display cancelled status for cancelled bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('filter-cancelled');

      await detoxExpect(
        element(by.id('booking-status-cancelled'))
      ).toBeVisible();
    });
  });

  describe('Cancel Booking', () => {
    it('should show cancel button for upcoming bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      await expectToBeVisible('cancel-booking-button');
    });

    it('should confirm before cancelling', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('cancel-booking-button');

      // Should show confirmation dialog
      await detoxExpect(
        element(by.text('Are you sure you want to cancel this booking?'))
      ).toBeVisible();
      await expectToBeVisible('confirm-cancel-button');
      await expectToBeVisible('dismiss-cancel-button');
    });

    it('should cancel booking when confirmed', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('cancel-booking-button');
      await tapButton('confirm-cancel-button');

      // Should show success message
      await detoxExpect(
        element(by.text('Booking cancelled successfully'))
      ).toBeVisible();

      // Status should update to cancelled
      await detoxExpect(
        element(by.id('booking-status-cancelled'))
      ).toBeVisible();
    });

    it('should not cancel when dismissed', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('cancel-booking-button');
      await tapButton('dismiss-cancel-button');

      // Status should remain confirmed
      await detoxExpect(
        element(by.id('booking-status-confirmed'))
      ).toBeVisible();
    });

    it('should not show cancel button for past bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('filter-past');
      await tapButton('booking-item-past-1');

      await detoxExpect(element(by.id('cancel-booking-button'))).not.toBeVisible();
    });

    it('should show refund information after cancellation', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('cancel-booking-button');
      await tapButton('confirm-cancel-button');

      await detoxExpect(
        element(by.text('Refund will be processed within 7-10 business days'))
      ).toBeVisible();
    });
  });

  describe('Real-time Tracking', () => {
    it('should show track bus button for active bookings', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-active-1');

      await expectToBeVisible('track-bus-button');
    });

    it('should navigate to tracking screen', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-active-1');
      await tapButton('track-bus-button');

      await expectToBeVisible('tracking-screen');
      await detoxExpect(element(by.text('Track Your Bus'))).toBeVisible();
    });

    it('should display bus location on map', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-active-1');
      await tapButton('track-bus-button');

      await expectToBeVisible('tracking-map');
      await expectToBeVisible('bus-marker');
    });

    it('should show estimated arrival time', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-active-1');
      await tapButton('track-bus-button');

      await detoxExpect(element(by.id('estimated-arrival'))).toBeVisible();
    });

    it('should update location in real-time', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-active-1');
      await tapButton('track-bus-button');

      // Wait for location update
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Location should have updated
      await detoxExpect(element(by.id('bus-marker'))).toBeVisible();
    });
  });

  describe('Ticket Validation', () => {
    it('should display ticket QR code', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      await expectToBeVisible('ticket-qr-code');
    });

    it('should allow scanning QR code', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('show-qr-fullscreen-button');

      await expectToBeVisible('qr-code-fullscreen');
    });

    it('should display booking reference number', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      await detoxExpect(element(by.id('booking-reference'))).toBeVisible();
    });

    it('should allow copying booking reference', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('copy-reference-button');

      await detoxExpect(
        element(by.text('Reference copied to clipboard'))
      ).toBeVisible();
    });
  });

  describe('Contact Support', () => {
    it('should show contact support button', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');

      await expectToBeVisible('contact-support-button');
    });

    it('should navigate to support screen', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('contact-support-button');

      await expectToBeVisible('support-screen');
    });

    it('should pre-fill booking information in support form', async () => {
      await tapButton('bookings-tab');
      await tapButton('booking-item-1');
      await tapButton('contact-support-button');

      // Booking ID should be pre-filled
      await detoxExpect(element(by.id('support-booking-id'))).toHaveText(
        expect.stringContaining('BK-')
      );
    });
  });

  describe('Notifications', () => {
    it('should show notification for upcoming trip', async () => {
      // Simulate time passing to trigger notification
      // This would require notification testing capabilities

      await tapButton('notifications-tab');
      await detoxExpect(
        element(by.text('Your trip to Saigon departs in 2 hours'))
      ).toBeVisible();
    });

    it('should navigate to booking from notification', async () => {
      await tapButton('notifications-tab');
      await tapButton('notification-item-1');

      await expectToBeVisible('booking-details-screen');
    });
  });

  describe('Booking Search', () => {
    it('should search bookings by destination', async () => {
      await tapButton('bookings-tab');
      await tapButton('search-bookings-button');
      await element(by.id('booking-search-input')).typeText('Saigon');

      // Should show only bookings to Saigon
      await detoxExpect(element(by.text('Saigon'))).toBeVisible();
    });

    it('should search bookings by date', async () => {
      await tapButton('bookings-tab');
      await tapButton('search-bookings-button');
      await element(by.id('booking-search-input')).typeText('2024-02-01');

      // Should show only bookings on that date
      await detoxExpect(element(by.id('bookings-list'))).toBeVisible();
    });

    it('should search bookings by reference number', async () => {
      await tapButton('bookings-tab');
      await tapButton('search-bookings-button');
      await element(by.id('booking-search-input')).typeText('BK-123456');

      // Should show specific booking
      await detoxExpect(element(by.text('BK-123456'))).toBeVisible();
    });
  });

  describe('Offline Support', () => {
    it('should display cached bookings when offline', async () => {
      // Turn off network
      await device.setURLBlacklist(['.*']);

      await tapButton('bookings-tab');

      // Should still show previously loaded bookings
      await expectToBeVisible('bookings-list');

      // Clear blacklist
      await device.setURLBlacklist([]);
    });

    it('should show offline indicator', async () => {
      await device.setURLBlacklist(['.*']);

      await tapButton('bookings-tab');

      await detoxExpect(
        element(by.text('You are offline'))
      ).toBeVisible();

      await device.setURLBlacklist([]);
    });

    it('should sync when coming back online', async () => {
      await device.setURLBlacklist(['.*']);
      await tapButton('bookings-tab');

      // Come back online
      await device.setURLBlacklist([]);
      await tapButton('refresh-bookings-button');

      await detoxExpect(
        element(by.text('Bookings updated'))
      ).toBeVisible();
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh bookings when pulled down', async () => {
      await tapButton('bookings-tab');

      // Pull to refresh
      await element(by.id('bookings-list')).swipe('down', 'fast', 0.9);

      // Should show loading indicator
      await detoxExpect(element(by.id('refresh-indicator'))).toBeVisible();
    });
  });
});
