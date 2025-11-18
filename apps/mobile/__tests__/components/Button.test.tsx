import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Button from '@components/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const {getByText} = render(
        <Button title="Click Me" onPress={() => {}} />
      );

      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render with testID', () => {
      const {getByTestId} = render(
        <Button title="Test" onPress={() => {}} testID="test-button" />
      );

      expect(getByTestId('test-button')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      const {getByText} = render(
        <Button title="Primary" onPress={() => {}} />
      );

      const button = getByText('Primary').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({backgroundColor: '#007AFF'}),
        ])
      );
    });

    it('should render secondary variant', () => {
      const {getByText} = render(
        <Button title="Secondary" onPress={() => {}} variant="secondary" />
      );

      const button = getByText('Secondary').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({backgroundColor: '#6c757d'}),
        ])
      );
    });

    it('should render outline variant', () => {
      const {getByText} = render(
        <Button title="Outline" onPress={() => {}} variant="outline" />
      );

      const button = getByText('Outline').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#007AFF',
          }),
        ])
      );
    });
  });

  describe('Press Handler', () => {
    it('should call onPress when pressed', () => {
      const onPressMock = jest.fn();
      const {getByText} = render(
        <Button title="Press Me" onPress={onPressMock} />
      );

      fireEvent.press(getByText('Press Me'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const {getByText} = render(
        <Button title="Disabled" onPress={onPressMock} disabled />
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPressMock = jest.fn();
      const {getByTestId} = render(
        <Button title="Loading" onPress={onPressMock} loading testID="btn" />
      );

      fireEvent.press(getByTestId('btn'));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled styles when disabled', () => {
      const {getByText} = render(
        <Button title="Disabled" onPress={() => {}} disabled />
      );

      const button = getByText('Disabled').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({backgroundColor: '#ccc'}),
        ])
      );
    });

    it('should have disabled accessibility state', () => {
      const {getByTestId} = render(
        <Button title="Test" onPress={() => {}} disabled testID="btn" />
      );

      const button = getByTestId('btn');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const {getByTestId} = render(
        <Button title="Submit" onPress={() => {}} loading testID="btn" />
      );

      expect(getByTestId('btn-loading')).toBeTruthy();
    });

    it('should not show title when loading', () => {
      const {queryByText, getByTestId} = render(
        <Button title="Submit" onPress={() => {}} loading testID="btn" />
      );

      expect(queryByText('Submit')).toBeNull();
      expect(getByTestId('btn-loading')).toBeTruthy();
    });

    it('should have disabled accessibility state when loading', () => {
      const {getByTestId} = render(
        <Button title="Test" onPress={() => {}} loading testID="btn" />
      );

      const button = getByTestId('btn');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom button style', () => {
      const customStyle = {backgroundColor: 'red'};
      const {getByText} = render(
        <Button title="Custom" onPress={() => {}} style={customStyle} />
      );

      const button = getByText('Custom').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([customStyle])
      );
    });

    it('should apply custom text style', () => {
      const customTextStyle = {fontSize: 20};
      const {getByText} = render(
        <Button title="Custom" onPress={() => {}} textStyle={customTextStyle} />
      );

      const text = getByText('Custom');
      expect(text.props.style).toEqual(
        expect.arrayContaining([customTextStyle])
      );
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      const {getByTestId} = render(
        <Button title="Test" onPress={() => {}} testID="btn" />
      );

      const button = getByTestId('btn');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility label', () => {
      const {getByTestId} = render(
        <Button title="Click Me" onPress={() => {}} testID="btn" />
      );

      const button = getByTestId('btn');
      expect(button.props.accessibilityLabel).toBe('Click Me');
    });
  });
});
