import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import LoginScreen from '@screens/LoginScreen';
import {useAuthStore} from '@store/authStore';

// Mock the auth store
jest.mock('@store/authStore');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockLogin = jest.fn();
  const mockLoginWithOAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockLogin,
      loginWithOAuth: mockLoginWithOAuth,
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render login screen correctly', () => {
      const {getByTestId, getByText} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Big Bus Login')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
    });

    it('should render OAuth login buttons', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      expect(getByTestId('google-login-button')).toBeTruthy();
      expect(getByTestId('facebook-login-button')).toBeTruthy();
      expect(getByTestId('zalo-login-button')).toBeTruthy();
    });

    it('should render navigation links', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      expect(getByTestId('register-link')).toBeTruthy();
      expect(getByTestId('forgot-password-link')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update email input', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const passwordInput = getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    it('should mask password input', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Login Submission', () => {
    it('should show error when fields are empty', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const loginButton = getByTestId('login-button');
      fireEvent.press(loginButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please fill in all fields'
      );
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should call login with correct credentials', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should navigate to Home on successful login', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('should show error alert on login failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Login failed. Please check your credentials.'
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when logging in', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        login: mockLogin,
        loginWithOAuth: mockLoginWithOAuth,
        isLoading: true,
      });

      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('OAuth Login', () => {
    it('should show alert when Google login is pressed', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const googleButton = getByTestId('google-login-button');
      fireEvent.press(googleButton);

      expect(Alert.alert).toHaveBeenCalledWith('OAuth', 'Logging in with google...');
    });

    it('should show alert when Facebook login is pressed', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const facebookButton = getByTestId('facebook-login-button');
      fireEvent.press(facebookButton);

      expect(Alert.alert).toHaveBeenCalledWith('OAuth', 'Logging in with facebook...');
    });

    it('should show alert when Zalo login is pressed', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const zaloButton = getByTestId('zalo-login-button');
      fireEvent.press(zaloButton);

      expect(Alert.alert).toHaveBeenCalledWith('OAuth', 'Logging in with zalo...');
    });
  });

  describe('Navigation', () => {
    it('should navigate to Register screen', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const registerLink = getByTestId('register-link');
      fireEvent.press(registerLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });

    it('should navigate to ForgotPassword screen', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      const forgotPasswordLink = getByTestId('forgot-password-link');
      fireEvent.press(forgotPasswordLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });

  describe('Accessibility', () => {
    it('should have proper testIDs for automation', () => {
      const {getByTestId} = render(
        <LoginScreen navigation={mockNavigation} />
      );

      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
      expect(getByTestId('google-login-button')).toBeTruthy();
      expect(getByTestId('facebook-login-button')).toBeTruthy();
      expect(getByTestId('zalo-login-button')).toBeTruthy();
    });
  });
});
