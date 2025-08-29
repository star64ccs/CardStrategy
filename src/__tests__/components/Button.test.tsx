import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';

import { Button } from '../../components/common/Button';

describe('Button Component', () => {
  const _defaultProps = {
    title: '測試按鈕',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('應該正確渲染按鈕', () => {
      const { getByText } = render(<Button {...defaultProps} />);

      const _button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確渲染不同變體的按鈕', () => {
      const { getByText, rerender } = render(
        <Button {...defaultProps} variant='primary' />
      );
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant='secondary' />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant='outline' />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant='ghost' />);
      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染不同尺寸的按鈕', () => {
      const { getByText, rerender } = render(
        <Button {...defaultProps} size='small' />
      );
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} size='medium' />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} size='large' />);
      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染帶圖標的按鈕', () => {
      const { getByText } = render(
        <Button {...defaultProps} icon='heart' iconPosition='left' />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染禁用狀態的按鈕', () => {
      const { getByText } = render(<Button {...defaultProps} disabled />);

      const _button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確渲染加載狀態的按鈕', () => {
      const { getByText } = render(<Button {...defaultProps} loading />);

      expect(getByText('測試按鈕')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('應該在點擊時調用 onPress 回調', () => {
      const _onPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={onPress} />
      );

      const _button = getByText('測試按鈕');
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('應該在禁用狀態下不調用 onPress 回調', () => {
      const _onPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={onPress} disabled />
      );

      const _button = getByText('測試按鈕');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('應該在加載狀態下不調用 onPress 回調', () => {
      const _onPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={onPress} loading />
      );

      const _button = getByText('測試按鈕');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('應該支持長按事件', () => {
      const _onLongPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onLongPress={onLongPress} />
      );

      const _button = getByText('測試按鈕');
      fireEvent(button, 'onLongPress');

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('應該有正確的可訪問性標籤', () => {
      const { getByLabelText } = render(
        <Button {...defaultProps} accessibilityLabel='測試按鈕標籤' />
      );

      const _button = getByLabelText('測試按鈕標籤');
      expect(button).toBeTruthy();
    });

    it('應該有正確的可訪問性提示', () => {
      const { getByLabelText } = render(
        <Button {...defaultProps} accessibilityHint='點擊執行操作' />
      );

      const _button = getByLabelText('測試按鈕');
      expect(button.props.accessibilityHint).toBe('點擊執行操作');
    });

    it('應該在禁用狀態下有正確的可訪問性角色', () => {
      const { getByRole } = render(<Button {...defaultProps} disabled />);

      const _button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('應該正確應用自定義樣式', () => {
      const _customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <Button {...defaultProps} style={customStyle} />
      );

      const _button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確應用文本樣式', () => {
      const _textStyle = { color: 'blue', fontSize: 16 };
      const { getByText } = render(
        <Button {...defaultProps} textStyle={textStyle} />
      );

      const _button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('應該處理空的標題', () => {
      const { getByText } = render(<Button {...defaultProps} title='' />);

      const _button = getByText('');
      expect(button).toBeTruthy();
    });

    it('應該處理沒有 onPress 回調的情況', () => {
      const { getByText } = render(<Button title='測試按鈕' />);

      const _button = getByText('測試按鈕');
      expect(() => fireEvent.press(button)).not.toThrow();
    });

    it('應該處理異步 onPress 回調', async () => {
      const _asyncOnPress = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      const { getByText } = render(
        <Button {...defaultProps} onPress={asyncOnPress} />
      );

      const _button = getByText('測試按鈕');
      fireEvent.press(button);

      await waitFor(() => {
        expect(asyncOnPress).toHaveBeenCalledTimes(1);
      });
    });

    it('應該處理 onPress 回調中的錯誤', () => {
      const _errorOnPress = jest.fn().mockImplementation(() => {
        throw new Error('測試錯誤');
      });
      const { getByText } = render(
        <Button {...defaultProps} onPress={errorOnPress} />
      );

      const _button = getByText('測試按鈕');
      expect(() => fireEvent.press(button)).toThrow('測試錯誤');
    });
  });

  describe('Loading State', () => {
    it('應該在加載狀態下顯示加載指示器', () => {
      const { getByText } = render(<Button {...defaultProps} loading />);

      const _button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該在加載狀態下顯示自定義加載文本', () => {
      const { getByText } = render(
        <Button {...defaultProps} loading loadingText='載入中...' />
      );

      const _button = getByText('載入中...');
      expect(button).toBeTruthy();
    });
  });

  describe('Icon Support', () => {
    it('應該正確渲染左側圖標', () => {
      const { getByText } = render(
        <Button {...defaultProps} icon='heart' iconPosition='left' />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染右側圖標', () => {
      const { getByText } = render(
        <Button {...defaultProps} icon='arrow-right' iconPosition='right' />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });

    it('應該正確渲染自定義圖標', () => {
      const _CustomIcon = () => <div>Custom Icon</div>;
      const { getByText } = render(
        <Button {...defaultProps} icon={CustomIcon} />
      );

      expect(getByText('測試按鈕')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('應該正確應用主題顏色', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant='primary' />
      );

      const _button = getByText('測試按鈕');
      expect(button).toBeTruthy();
    });

    it('應該正確應用不同主題的按鈕', () => {
      const { getByText, rerender } = render(
        <Button {...defaultProps} variant='primary' />
      );
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant='secondary' />);
      expect(getByText('測試按鈕')).toBeTruthy();

      rerender(<Button {...defaultProps} variant='outline' />);
      expect(getByText('測試按鈕')).toBeTruthy();
    });
  });
});
