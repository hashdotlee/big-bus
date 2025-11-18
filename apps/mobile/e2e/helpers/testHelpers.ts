import {device, element, by, expect as detoxExpect, waitFor} from 'detox';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const reloadApp = async () => {
  await device.reloadReactNative();
};

export const launchApp = async (params?: any) => {
  await device.launchApp(params);
};

export const terminateApp = async () => {
  await device.terminateApp();
};

export const clearAppData = async () => {
  await device.clearKeychain();
};

export const typeText = async (testID: string, text: string) => {
  await element(by.id(testID)).tap();
  await element(by.id(testID)).typeText(text);
};

export const tapButton = async (testID: string) => {
  await element(by.id(testID)).tap();
};

export const scrollTo = async (testID: string, direction: 'up' | 'down' = 'down') => {
  await element(by.id(testID)).scroll(100, direction);
};

export const expectToBeVisible = async (testID: string) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
};

export const expectToHaveText = async (testID: string, text: string) => {
  await detoxExpect(element(by.id(testID))).toHaveText(text);
};

export const waitForElement = async (testID: string, timeout: number = 5000) => {
  await waitFor(element(by.id(testID)))
    .toExist()
    .withTimeout(timeout);
};

export const loginUser = async (email: string, password: string) => {
  await typeText('email-input', email);
  await typeText('password-input', password);
  await tapButton('login-button');
};

export const logout = async () => {
  // Navigate to profile or settings
  // Tap logout button
  // This is a placeholder - implement based on your navigation
  await tapButton('logout-button');
};

export const navigateBack = async () => {
  await element(by.id('back-button')).tap();
};

export const selectRoute = async (routeId: string) => {
  await tapButton(`route-item-${routeId}`);
};

export const selectSeat = async (seatNumber: string) => {
  await tapButton(`seat-${seatNumber}`);
};

export const fillPassengerInfo = async (
  fullName: string,
  phoneNumber: string,
  email: string
) => {
  await typeText('fullname-input', fullName);
  await typeText('phone-input', phoneNumber);
  await typeText('email-input', email);
};

export const selectPaymentMethod = async (method: string) => {
  await tapButton(`payment-${method}`);
};

export const confirmBooking = async () => {
  await tapButton('confirm-booking-button');
};

export const searchRoute = async (
  departure: string,
  destination: string,
  date: string
) => {
  await typeText('departure-input', departure);
  await typeText('destination-input', destination);
  await typeText('date-input', date);
  await tapButton('search-button');
};
