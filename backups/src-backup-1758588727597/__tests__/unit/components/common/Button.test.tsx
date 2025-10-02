// 按鈕組件單元測試
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import Button from '../../../../../src/components/common/Button';
import { cleanupTest } from '../../../fixtures/test-utils';

// Mock 外部依賴
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
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

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('基本渲染', () => {
    it('應該正確渲染按鈕文字', () => {
      // Arrange
      const buttonText = 'Click Me';

      // Act
      render(<Button title={buttonText} onPress={() => {}} />);

      // Assert
      expect(screen.getByText(buttonText)).toBeTruthy();
    });

    it('應該正確渲染不同類型的按鈕', () => {
      // Arrange
      const primaryButton = 'Primary Button';
      const secondaryButton = 'Secondary Button';

      // Act
      render(
        <>
          <Button title={primaryButton} variant='primary' onPress={() => {}} />
          <Button
            title={secondaryButton}
            variant='secondary'
            onPress={() => {}}
          />
        </>
      );

      // Assert
      expect(screen.getByText(primaryButton)).toBeTruthy();
      expect(screen.getByText(secondaryButton)).toBeTruthy();
    });

    it('應該正確渲染不同大小的按鈕', () => {
      // Arrange
      const smallButton = 'Small Button';
      const largeButton = 'Large Button';

      // Act
      render(
        <>
          <Button title={smallButton} size='small' onPress={() => {}} />
          <Button title={largeButton} size='large' onPress={() => {}} />
        </>
      );

      // Assert
      expect(screen.getByText(smallButton)).toBeTruthy();
      expect(screen.getByText(largeButton)).toBeTruthy();
    });
  });

  describe('用戶交互', () => {
    it('應該響應點擊事件', async () => {
      // Arrange
      const mockOnPress = jest.fn();
      const buttonText = 'Click Me';

      // Act
      render(<Button title={buttonText} onPress={mockOnPress} />);
      const button = screen.getByText(buttonText);

      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      });
    });

    it('應該響應多次點擊事件', async () => {
      // Arrange
      const mockOnPress = jest.fn();
      const buttonText = 'Click Me';

      // Act
      render(<Button title={buttonText} onPress={mockOnPress} />);
      const button = screen.getByText(buttonText);

      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnPress).toHaveBeenCalledTimes(3);
      });
    });

    it('應該在禁用狀態下不響應點擊事件', async () => {
      // Arrange
      const mockOnPress = jest.fn();
      const buttonText = 'Disabled Button';

      // Act
      render(<Button title={buttonText} onPress={mockOnPress} disabled />);
      const button = screen.getByText(buttonText);

      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnPress).not.toHaveBeenCalled();
      });
    });

    it('應該在加載狀態下不響應點擊事件', async () => {
      // Arrange
      const mockOnPress = jest.fn();
      const buttonText = 'Loading Button';

      // Act
      render(<Button title={buttonText} onPress={mockOnPress} loading />);
      const button = screen.getByText(buttonText);

      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnPress).not.toHaveBeenCalled();
      });
    });
  });

  describe('加載狀態', () => {
    it('應該顯示加載指示器', () => {
      // Arrange
      const buttonText = 'Loading Button';

      // Act
      render(
        <Button
          title={buttonText}
          onPress={() => {}}
          loading
          testID='loading-button'
        />
      );

      // Assert
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    it('應該在加載時隱藏按鈕文字', () => {
      // Arrange
      const buttonText = 'Loading Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} loading />);

      // Assert
      expect(screen.queryByText(buttonText)).toBeNull();
    });

    it('應該在加載完成後顯示按鈕文字', async () => {
      // Arrange
      const buttonText = 'Loading Button';
      const { rerender } = render(
        <Button title={buttonText} onPress={() => {}} loading />
      );

      // Act
      rerender(
        <Button title={buttonText} onPress={() => {}} loading={false} />
      );

      // Assert
      expect(screen.getByText(buttonText)).toBeTruthy();
      expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });
  });

  describe('禁用狀態', () => {
    it('應該正確顯示禁用狀態', () => {
      // Arrange
      const buttonText = 'Disabled Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} disabled />);

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的 disabled 屬性
      expect(button.parent?.props.disabled).toBe(true);
    });

    it('應該在禁用狀態下顯示不同的樣式', () => {
      // Arrange
      const buttonText = 'Disabled Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} disabled />);

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式
      expect(button.parent?.props.style).toMatchObject({
        opacity: 0.5,
      });
    });
  });

  describe('圖標支持', () => {
    it('應該正確顯示左側圖標', () => {
      // Arrange
      const buttonText = 'Button with Icon';
      const mockIcon = 'icon-name';

      // Act
      render(<Button title={buttonText} onPress={() => {}} icon={mockIcon} />);

      // Assert
      // 圖標會渲染為 Ionicons，我們檢查圖標是否存在
      expect(screen.getByTestId('button-icon')).toBeTruthy();
    });

    it('應該正確顯示右側圖標', () => {
      // Arrange
      const buttonText = 'Button with Icon';
      const mockIcon = 'icon-name';

      // Act
      render(
        <Button
          title={buttonText}
          onPress={() => {}}
          icon={mockIcon}
          iconPosition='right'
        />
      );

      // Assert
      expect(screen.getByTestId('button-icon')).toBeTruthy();
    });

    it('應該在沒有圖標時不顯示圖標元素', () => {
      // Arrange
      const buttonText = 'Button without Icon';

      // Act
      render(<Button title={buttonText} onPress={() => {}} />);

      // Assert
      expect(screen.queryByTestId('button-icon')).toBeNull();
    });
  });

  describe('樣式變體', () => {
    it('應該正確應用主要按鈕樣式', () => {
      // Arrange
      const buttonText = 'Primary Button';

      // Act
      render(
        <Button title={buttonText} onPress={() => {}} variant='primary' />
      );

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式，而不是文字樣式
      expect(button.parent?.props.style).toMatchObject({
        backgroundColor: '#007AFF',
      });
    });

    it('應該正確應用次要按鈕樣式', () => {
      // Arrange
      const buttonText = 'Secondary Button';

      // Act
      render(
        <Button title={buttonText} onPress={() => {}} variant='secondary' />
      );

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式
      expect(button.parent?.props.style).toMatchObject({
        backgroundColor: '#F2F2F7',
      });
    });

    it('應該正確應用危險按鈕樣式', () => {
      // Arrange
      const buttonText = 'Danger Button';

      // Act
      render(
        <Button title={buttonText} onPress={() => {}} variant='outline' />
      );

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式
      expect(button.parent?.props.style).toMatchObject({
        backgroundColor: 'transparent',
        borderColor: '#007AFF',
      });
    });
  });

  describe('尺寸變體', () => {
    it('應該正確應用小尺寸樣式', () => {
      // Arrange
      const buttonText = 'Small Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} size='small' />);

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式
      expect(button.parent?.props.style).toMatchObject({
        paddingHorizontal: 12,
        paddingVertical: 8,
      });
    });

    it('應該正確應用中等尺寸樣式', () => {
      // Arrange
      const buttonText = 'Medium Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} size='medium' />);

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式
      expect(button.parent?.props.style).toMatchObject({
        paddingHorizontal: 16,
        paddingVertical: 12,
      });
    });

    it('應該正確應用大尺寸樣式', () => {
      // Arrange
      const buttonText = 'Large Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} size='large' />);

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的樣式
      expect(button.parent?.props.style).toMatchObject({
        paddingHorizontal: 20,
        paddingVertical: 16,
      });
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空標題', () => {
      // Arrange
      const emptyTitle = '';

      // Act
      render(
        <Button title={emptyTitle} onPress={() => {}} testID='empty-button' />
      );

      // Assert
      expect(screen.getByTestId('empty-button')).toBeTruthy();
    });

    it('應該處理超長標題', () => {
      // Arrange
      const longTitle = 'A'.repeat(1000);

      // Act
      render(<Button title={longTitle} onPress={() => {}} />);

      // Assert
      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('應該處理特殊字符標題', () => {
      // Arrange
      const specialTitle = 'Button with Special Chars: !@#$%^&*()';

      // Act
      render(<Button title={specialTitle} onPress={() => {}} />);

      // Assert
      expect(screen.getByText(specialTitle)).toBeTruthy();
    });

    it('應該處理未定義的 onPress 函數', () => {
      // Arrange
      const buttonText = 'Button without onPress';

      // Act & Assert
      expect(() => {
        render(<Button title={buttonText} onPress={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('可訪問性', () => {
    it('應該有正確的可訪問性標籤', () => {
      // Arrange
      const buttonText = 'Accessible Button';
      const accessibilityLabel = 'Accessible Button Label';

      // Act
      render(
        <Button
          title={buttonText}
          onPress={() => {}}
          accessibilityLabel={accessibilityLabel}
        />
      );

      // Assert
      const button = screen.getByLabelText(accessibilityLabel);
      expect(button).toBeTruthy();
    });

    it('應該有正確的可訪問性提示', () => {
      // Arrange
      const buttonText = 'Button with Hint';
      const accessibilityHint = 'Double tap to activate';

      // Act
      render(
        <Button
          title={buttonText}
          onPress={() => {}}
          accessibilityHint={accessibilityHint}
        />
      );

      // Assert
      const button = screen.getByHintText(accessibilityHint);
      expect(button).toBeTruthy();
    });

    it('應該在禁用狀態下有正確的可訪問性狀態', () => {
      // Arrange
      const buttonText = 'Disabled Button';

      // Act
      render(<Button title={buttonText} onPress={() => {}} disabled />);

      // Assert
      const button = screen.getByText(buttonText);
      // 檢查按鈕容器的 accessibilityState
      expect(button.parent?.props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });
  });
});
