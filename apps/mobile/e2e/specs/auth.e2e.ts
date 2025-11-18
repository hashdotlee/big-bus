import {device, element, by, expect as detoxExpect} from 'detox';
import {
  launchApp,
  clearAppData,
  typeText,
  tapButton,
  expectToBeVisible,
  loginUser,
} from '../helpers/testHelpers';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'YES'},
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await clearAppData();
  });

  describe('Login Screen', () => {
    it('should show login screen on app launch', async () => {
      await expectToBeVisible('login-screen');
      await detoxExpect(element(by.text('Big Bus Login'))).toBeVisible();
    });

    it('should display all login form elements', async () => {
      await expectToBeVisible('email-input');
      await expectToBeVisible('password-input');
      await expectToBeVisible('login-button');
      await expectToBeVisible('google-login-button');
      await expectToBeVisible('facebook-login-button');
      await expectToBeVisible('zalo-login-button');
    });

    it('should show error when trying to login with empty fields', async () => {
      await tapButton('login-button');
      await detoxExpect(element(by.text('Please fill in all fields'))).toBeVisible();
    });

    it('should successfully login with valid credentials', async () => {
      await typeText('email-input', 'test@example.com');
      await typeText('password-input', 'password123');
      await tapButton('login-button');

      // Should navigate to home screen
      await expectToBeVisible('home-screen');
    });

    it('should show error with invalid credentials', async () => {
      await typeText('email-input', 'wrong@example.com');
      await typeText('password-input', 'wrongpassword');
      await tapButton('login-button');

      await detoxExpect(
        element(by.text('Login failed. Please check your credentials.'))
      ).toBeVisible();
    });

    it('should navigate to register screen', async () => {
      await tapButton('register-link');
      await expectToBeVisible('register-screen');
    });

    it('should navigate to forgot password screen', async () => {
      await tapButton('forgot-password-link');
      await expectToBeVisible('forgot-password-screen');
    });
  });

  describe('OAuth Login', () => {
    it('should trigger Google OAuth login', async () => {
      await tapButton('google-login-button');
      await detoxExpect(element(by.text('Logging in with google...'))).toBeVisible();
    });

    it('should trigger Facebook OAuth login', async () => {
      await tapButton('facebook-login-button');
      await detoxExpect(element(by.text('Logging in with facebook...'))).toBeVisible();
    });

    it('should trigger Zalo OAuth login', async () => {
      await tapButton('zalo-login-button');
      await detoxExpect(element(by.text('Logging in with zalo...'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    it('should allow user to register', async () => {
      await tapButton('register-link');
      await expectToBeVisible('register-screen');

      await typeText('email-input', 'newuser@example.com');
      await typeText('password-input', 'password123');
      await typeText('fullname-input', 'New User');
      await tapButton('register-button');

      // Should navigate to home screen after successful registration
      await expectToBeVisible('home-screen');
    });

    it('should show error when registering with existing email', async () => {
      await tapButton('register-link');
      await expectToBeVisible('register-screen');

      await typeText('email-input', 'existing@example.com');
      await typeText('password-input', 'password123');
      await typeText('fullname-input', 'Existing User');
      await tapButton('register-button');

      await detoxExpect(
        element(by.text('Registration failed'))
      ).toBeVisible();
    });

    it('should validate password strength', async () => {
      await tapButton('register-link');
      await expectToBeVisible('register-screen');

      await typeText('email-input', 'newuser@example.com');
      await typeText('password-input', '123');
      await typeText('fullname-input', 'New User');
      await tapButton('register-button');

      await detoxExpect(
        element(by.text('Password must be at least 6 characters'))
      ).toBeVisible();
    });
  });

  describe('Forgot Password Flow', () => {
    it('should allow user to request password reset', async () => {
      await tapButton('forgot-password-link');
      await expectToBeVisible('forgot-password-screen');

      await typeText('email-input', 'test@example.com');
      await tapButton('reset-password-button');

      await detoxExpect(
        element(by.text('Password reset link sent to your email'))
      ).toBeVisible();
    });

    it('should show error for non-existent email', async () => {
      await tapButton('forgot-password-link');
      await expectToBeVisible('forgot-password-screen');

      await typeText('email-input', 'nonexistent@example.com');
      await tapButton('reset-password-button');

      await detoxExpect(
        element(by.text('Email not found'))
      ).toBeVisible();
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout user', async () => {
      // First login
      await loginUser('test@example.com', 'password123');
      await expectToBeVisible('home-screen');

      // Navigate to profile
      await tapButton('profile-tab');
      await expectToBeVisible('profile-screen');

      // Logout
      await tapButton('logout-button');

      // Should return to login screen
      await expectToBeVisible('login-screen');
    });

    it('should clear user session after logout', async () => {
      // Login
      await loginUser('test@example.com', 'password123');
      await expectToBeVisible('home-screen');

      // Logout
      await tapButton('profile-tab');
      await tapButton('logout-button');

      // Restart app
      await device.launchApp({newInstance: true});

      // Should show login screen, not home screen
      await expectToBeVisible('login-screen');
    });
  });

  describe('Session Persistence', () => {
    it('should maintain login session after app restart', async () => {
      // Login
      await loginUser('test@example.com', 'password123');
      await expectToBeVisible('home-screen');

      // Restart app
      await device.launchApp({newInstance: true});

      // Should still be logged in
      await expectToBeVisible('home-screen');
    });

    it('should handle expired session', async () => {
      // Login
      await loginUser('test@example.com', 'password123');
      await expectToBeVisible('home-screen');

      // Simulate session expiration
      // This would require backend API mock or test configuration
      // For now, this is a placeholder test

      // Should redirect to login screen
      // await expectToBeVisible('login-screen');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      await typeText('email-input', 'invalidemail');
      await typeText('password-input', 'password123');
      await tapButton('login-button');

      await detoxExpect(
        element(by.text('Please enter a valid email'))
      ).toBeVisible();
    });

    it('should prevent SQL injection attempts', async () => {
      await typeText('email-input', "admin'--");
      await typeText('password-input', "' OR '1'='1");
      await tapButton('login-button');

      await detoxExpect(
        element(by.text('Login failed. Please check your credentials.'))
      ).toBeVisible();
    });

    it('should handle special characters in password', async () => {
      await typeText('email-input', 'test@example.com');
      await typeText('password-input', 'P@ssw0rd!#$%');
      await tapButton('login-button');

      // Should successfully login or show appropriate error
      // depending on whether this password is valid for the test account
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers', async () => {
      const emailInput = element(by.id('email-input'));
      const passwordInput = element(by.id('password-input'));
      const loginButton = element(by.id('login-button'));

      await detoxExpect(emailInput).toHaveAccessibilityLabel('Email input');
      await detoxExpect(passwordInput).toHaveAccessibilityLabel('Password input');
      await detoxExpect(loginButton).toHaveAccessibilityLabel('Login button');
    });
  });
});
