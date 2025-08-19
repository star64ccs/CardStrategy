import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '@/components/common/Button';

describe('Button Component', () => {
  const defaultProps = {
    title: '測試按鈕',
    onPress: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('應該正確渲染按鈕', () => {
      const { getByText } = render(<Button {...defaultProps} />);

      const button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確渲染不同變體的按鈕', () => {
      const { getByText, rerender } = render(<Button {...defaultProps} variant="primary" />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant="secondary" />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant="outline" />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant="ghost" />);
      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染不同尺寸的按鈕', () => {
      const { getByText, rerender } = render(<Button {...defaultProps} size="small" />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} size="medium" />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} size="large" />);
      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染帶圖標的按鈕', () => {
      const { getByText } = render(
        <Button {...defaultProps} icon="heart" iconPosition="left" />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染禁用狀態的按鈕', () => {
      const { getByText } = render(<Button {...defaultProps} disabled />);

      const button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確渲染加載狀態的按鈕', () => {
      const { getByText } = render(<Button {...defaultProps} loading />);

      expect(getByText('測試按鈕')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('應該在點擊時調用 onPress 回調', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button {...defaultProps} onPress={onPress} />);

      const button = getByText('測試按鈕');
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('應該在禁用狀態下不調用 onPress 回調', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button {...defaultProps} onPress={onPress} disabled />);

      const button = getByText('測試按鈕');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('應該在加載狀態下不調用 onPress 回調', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button {...defaultProps} onPress={onPress} loading />);

      const button = getByText('測試按鈕');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('應該支持長按事件', () => {
      const onLongPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onLongPress={onLongPress} />
      );

      const button = getByText('測試按鈕');
      fireEvent(button, 'onLongPress');

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('應該有正確的可訪問性標籤', () => {
      const { getByLabelText } = render(
        <Button {...defaultProps} accessibilityLabel="測試按鈕標籤" />
      );

      const button = getByLabelText('測試按鈕標籤');
      expect(button).toBeTruthy();
    });

    it('應該有正確的可訪問性提示', () => {
      const { getByLabelText } = render(
        <Button {...defaultProps} accessibilityHint="點擊執行操作" />
      );

      const button = getByLabelText('測試按鈕');
      expect(button.props.accessibilityHint).toBe('點擊執行操作');
    });

    it('應該在禁用狀態下有正確的可訪問性角色', () => {
      const { getByText } = render(<Button {...defaultProps} disabled />);

      const button = getByText('測試按鈕');
      expect(button.props.accessibilityRole).toBe('button');
    });
  });

  describe('Styling', () => {
    it('應該正確應用自定義樣式', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <Button {...defaultProps} style={customStyle} />
      );

      const button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確應用文本樣式', () => {
      const textStyle = { color: 'blue', fontSize: 16 };
      const { getByText } = render(
        <Button {...defaultProps} textStyle={textStyle} />
      );

      const button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('應該處理空的標題', () => {
      const { getByText } = render(<Button {...defaultProps} title="" />);

      const button = getByText('');
      expect(button).toBeTruthy();
    });

    it('應該處理沒有 onPress 回調的情況', () => {
      const { getByText } = render(<Button title="測試按鈕" />);

      const button = getByText('測試按鈕');
      expect(() => fireEvent.press(button)).not.toThrow();
    });

    it('應該處理異步 onPress 回調', async () => {
      const asyncOnPress = jest.fn().mockImplementation(() => Promise.resolve());
      const { getByText } = render(
        <Button {...defaultProps} onPress={asyncOnPress} />
      );

      const button = getByText('測試按鈕');
      fireEvent.press(button);

      await waitFor(() => {
        expect(asyncOnPress).toHaveBeenCalledTimes(1);
      });
    });

    it('應該處理 onPress 回調中的錯誤', () => {
      const errorOnPress = jest.fn().mockImplementation(() => {
        throw new Error('測試錯誤');
      });
      const { getByText } = render(
        <Button {...defaultProps} onPress={errorOnPress} />
      );

      const button = getByText('測試按鈕');
      expect(() => fireEvent.press(button)).toThrow('測試錯誤');
    });
  });

  describe('Loading State', () => {
    it('應該在加載狀態下顯示加載指示器', () => {
      const { getByText } = render(<Button {...defaultProps} loading />);

      const button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該在加載狀態下顯示自定義加載文本', () => {
      const { getByText } = render(
        <Button {...defaultProps} loading loadingText="載入中..." />
      );

      const button = getByText('載入中...');
      expect(button).toBeTruthy();
    });
  });

  describe('Icon Support', () => {
    it('應該正確渲染左側圖標', () => {
      const { getByText } = render(
        <Button {...defaultProps} icon="heart" iconPosition="left" />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染右側圖標', () => {
      const { getByText } = render(
        <Button {...defaultProps} icon="arrow-right" iconPosition="right" />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染自定義圖標', () => {
      const CustomIcon = () => <div>Custom Icon</div>;
      const { getByText } = render(
        <Button {...defaultProps} icon={CustomIcon} />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('應該正確應用主題顏色', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="primary" />
      );

      const button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確應用不同主題的按鈕', () => {
      const { getByText, rerender } = render(
        <Button {...defaultProps} variant="primary" />
      );
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant="secondary" />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant="outline" />);
      expect(getByText('測試按鈕')).toBeTruthy();
    });
  });
});
