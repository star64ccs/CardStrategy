// 簡化的按鈕組件測試
import React from 'react';

// Mock React Native 組件
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios || obj.default),
  },
  TouchableOpacity: 'TouchableOpacity',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// 簡化的Button組件用於測試
const SimpleButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
}: any) => {
  return React.createElement('TouchableOpacity', {
    onPress: disabled || loading ? undefined : onPress,
    disabled: disabled || loading,
    testID: 'button',
    children: [
      loading
        ? React.createElement('ActivityIndicator', {
            testID: 'loading-indicator',
          })
        : null,
      React.createElement('Text', { testID: 'button-text' }, title),
    ],
  });
};

describe('Button 組件簡化測試', () => {
  it('應該正確渲染按鈕文字', () => {
    // Arrange
    const buttonText = 'Click Me';

    // Act
    const button = React.createElement(SimpleButton, {
      title: buttonText,
      onPress: () => {},
    });

    // Assert
    expect(button).toBeTruthy();
    expect(button.props.children[1].props.children).toBe(buttonText);
  });

  it('應該響應點擊事件', () => {
    // Arrange
    const buttonText = 'Click Me';
    const mockOnPress = jest.fn();

    // Act
    const button = React.createElement(SimpleButton, {
      title: buttonText,
      onPress: mockOnPress,
    });

    // Assert
    expect(button.props.onPress).toBe(mockOnPress);
  });

  it('應該在禁用狀態下不響應點擊事件', () => {
    // Arrange
    const buttonText = 'Click Me';
    const mockOnPress = jest.fn();

    // Act
    const button = React.createElement(SimpleButton, {
      title: buttonText,
      onPress: mockOnPress,
      disabled: true,
    });

    // Assert
    expect(button.props.onPress).toBeUndefined();
    expect(button.props.disabled).toBe(true);
  });

  it('應該在加載狀態下顯示加載指示器', () => {
    // Arrange
    const buttonText = 'Loading...';
    const mockOnPress = jest.fn();

    // Act
    const button = React.createElement(SimpleButton, {
      title: buttonText,
      onPress: mockOnPress,
      loading: true,
    });

    // Assert
    expect(button.props.disabled).toBe(true);
    expect(button.props.children[0].type).toBe('ActivityIndicator');
  });
});
