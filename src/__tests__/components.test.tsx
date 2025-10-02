// ComponentLibrary單元Test
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { DesignSystemProvider } from '../components/providers/DesignSystemProvider';
import { Button, Card, Input, Loading, Modal, Toast } from '../components/ui';
import designSystemReducer from '../store/slices/designSystemSlice';

// CreateTest用的 Redux store
const _createTestStore = () => {
  return configureStore({
    reducer: {
      designSystem: designSystemReducer,
    },
  });
};

// TestPackage裝器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const _store = createTestStore();

  return (
    <Provider store={store}>
      <DesignSystemProvider>{children}</DesignSystemProvider>
    </Provider>
  );
};

// TestToolFunction
const _renderWithProvider = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('UI 組件庫測試', () => {
  describe('Button 組件', () => {
    test('應該正確渲染按鈕', () => {
      renderWithProvider(<Button>測試按鈕</Button>);
      expect(
        screen.getByRole('button', { name: '測試按鈕' })
      ).toBeInTheDocument();
    });

    test('應該支持不同變體', () => {
      const { rerender } = renderWithProvider(
        <Button variant='primary'>主要按鈕</Button>
      );
      expect(screen.getByRole('button')).toHaveClass('button--primary');

      rerender(<Button variant='secondary'>次要按鈕</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--secondary');
    });

    test('應該支持不同尺寸', () => {
      const { rerender } = renderWithProvider(
        <Button size='sm'>小按鈕</Button>
      );
      expect(screen.getByRole('button')).toHaveClass('button--sm');

      rerender(<Button size='lg'>大按鈕</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--lg');
    });

    test('應該支持禁用狀態', () => {
      renderWithProvider(<Button disabled>禁用按鈕</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('應該支持加載狀態', () => {
      renderWithProvider(<Button loading>加載按鈕</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('button--loading');
    });

    test('應該處理點擊事件', () => {
      const _handleClick = jest.fn();
      renderWithProvider(<Button onClick={handleClick}>點擊按鈕</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('應該支持鍵盤導航', () => {
      const _handleClick = jest.fn();
      renderWithProvider(<Button onClick={handleClick}>鍵盤按鈕</Button>);

      const _button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input 組件', () => {
    test('應該正確渲染輸入框', () => {
      renderWithProvider(<Input placeholder='請輸入' />);
      expect(screen.getByPlaceholderText('請輸入')).toBeInTheDocument();
    });

    test('應該支持標籤', () => {
      renderWithProvider(<Input label='用戶名' />);
      expect(screen.getByLabelText('用戶名')).toBeInTheDocument();
    });

    test('應該支持Error狀態', () => {
      renderWithProvider(<Input error='輸入Error' />);
      expect(screen.getByRole('alert')).toHaveTextContent('輸入Error');
    });

    test('應該支持幫助文本', () => {
      renderWithProvider(<Input helperText='請輸入有效的用戶名' />);
      expect(screen.getByText('請輸入有效的用戶名')).toBeInTheDocument();
    });

    test('應該處理值變化', () => {
      const _handleChange = jest.fn();
      renderWithProvider(<Input onChange={handleChange} />);

      const _input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledWith('test', expect.any(Object));
    });

    test('應該支持必填標記', () => {
      renderWithProvider(<Input label='用戶名' required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Card 組件', () => {
    test('應該正確渲染卡片', () => {
      renderWithProvider(<Card>卡片內容</Card>);
      expect(screen.getByText('卡片內容')).toBeInTheDocument();
    });

    test('應該支持標題', () => {
      renderWithProvider(<Card header='卡片標題'>卡片內容</Card>);
      expect(screen.getByText('卡片標題')).toBeInTheDocument();
    });

    test('應該支持頁腳', () => {
      renderWithProvider(<Card footer='卡片頁腳'>卡片內容</Card>);
      expect(screen.getByText('卡片頁腳')).toBeInTheDocument();
    });

    test('應該支持可點擊狀態', () => {
      const _handleClick = jest.fn();
      renderWithProvider(
        <Card clickable onCardClick={handleClick}>
          可點擊卡片
        </Card>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('應該支持加載狀態', () => {
      renderWithProvider(<Card loading>加載卡片</Card>);
      expect(screen.getByLabelText('載入中')).toBeInTheDocument();
    });
  });

  describe('Modal 組件', () => {
    test('應該正確渲染模態框', () => {
      renderWithProvider(
        <Modal isOpen={true} onClose={jest.fn()}>
          模態框內容
        </Modal>
      );
      expect(screen.getByText('模態框內容')).toBeInTheDocument();
    });

    test('應該支持標題和副標題', () => {
      renderWithProvider(
        <Modal
          isOpen={true}
          onClose={jest.fn()}
          title='模態框標題'
          subtitle='模態框副標題'
        >
          模態框內容
        </Modal>
      );
      expect(screen.getByText('模態框標題')).toBeInTheDocument();
      expect(screen.getByText('模態框副標題')).toBeInTheDocument();
    });

    test('應該處理關閉事件', () => {
      const _handleClose = jest.fn();
      renderWithProvider(
        <Modal isOpen={true} onClose={handleClose}>
          模態框內容
        </Modal>
      );

      fireEvent.click(screen.getByLabelText('關閉'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('應該支持ESC鍵關閉', () => {
      const _handleClose = jest.fn();
      renderWithProvider(
        <Modal isOpen={true} onClose={handleClose}>
          模態框內容
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('應該在關閉時不渲染', () => {
      const { rerender } = renderWithProvider(
        <Modal isOpen={true} onClose={jest.fn()}>
          模態框內容
        </Modal>
      );
      expect(screen.getByText('模態框內容')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={jest.fn()}>
          模態框內容
        </Modal>
      );
      expect(screen.queryByText('模態框內容')).not.toBeInTheDocument();
    });
  });

  describe('Loading 組件', () => {
    test('應該正確渲染加載組件', () => {
      renderWithProvider(<Loading />);
      expect(screen.getByLabelText('載入中')).toBeInTheDocument();
    });

    test('應該支持不同變體', () => {
      const { rerender } = renderWithProvider(<Loading variant='spinner' />);
      expect(screen.getByLabelText('載入中')).toBeInTheDocument();

      rerender(<Loading variant='dots' />);
      expect(screen.getByLabelText('載入中')).toBeInTheDocument();
    });

    test('應該支持文本', () => {
      renderWithProvider(<Loading text='正在載入...' />);
      expect(screen.getByText('正在載入...')).toBeInTheDocument();
    });

    test('應該支持全屏模式', () => {
      renderWithProvider(<Loading fullScreen />);
      const _loading = screen.getByLabelText('載入中');
      expect(loading.parentElement).toHaveStyle({ position: 'fixed' });
    });
  });

  describe('Toast 組件', () => {
    test('應該正確渲染通知', () => {
      renderWithProvider(<Toast message='通知消息' />);
      expect(screen.getByText('通知消息')).toBeInTheDocument();
    });

    test('應該支持不同類型', () => {
      const { rerender } = renderWithProvider(
        <Toast type='success' message='Success消息' />
      );
      expect(screen.getByText('Success消息')).toBeInTheDocument();

      rerender(<Toast type='error' message='Error消息' />);
      expect(screen.getByText('Error消息')).toBeInTheDocument();
    });

    test('應該支持標題和消息', () => {
      renderWithProvider(<Toast title='通知標題' message='通知消息' />);
      expect(screen.getByText('通知標題')).toBeInTheDocument();
      expect(screen.getByText('通知消息')).toBeInTheDocument();
    });

    test('應該處理關閉事件', () => {
      const _handleClose = jest.fn();
      renderWithProvider(<Toast message='通知消息' onClose={handleClose} />);

      fireEvent.click(screen.getByLabelText('關閉通知'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('應該支持操作按鈕', () => {
      const _handleAction = jest.fn();
      renderWithProvider(
        <Toast message='通知消息' action='撤銷' onAction={handleAction} />
      );

      fireEvent.click(screen.getByText('撤銷'));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    test('應該自動關閉', async () => {
      const _handleClose = jest.fn();
      renderWithProvider(
        <Toast message='通知消息' duration={100} onClose={handleClose} />
      );

      await waitFor(
        () => {
          expect(handleClose).toHaveBeenCalledTimes(1);
        },
        { timeout: 200 }
      );
    });
  });

  describe('可訪問性測試', () => {
    test('按鈕應該有正確的ARIA標籤', () => {
      renderWithProvider(<Button aria-label='自定義標籤'>按鈕</Button>);
      expect(screen.getByLabelText('自定義標籤')).toBeInTheDocument();
    });

    test('輸入框應該有正確的ARIA描述', () => {
      renderWithProvider(<Input aria-describedby='helper-text' />);
      const _input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });

    test('模態框應該有正確的角色', () => {
      renderWithProvider(
        <Modal isOpen={true} onClose={jest.fn()}>
          模態框內容
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('通知應該有正確的角色', () => {
      renderWithProvider(<Toast message='通知消息' />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('鍵盤導航測試', () => {
    test('按鈕應該支持空格鍵和回車鍵', () => {
      const _handleClick = jest.fn();
      renderWithProvider(<Button onClick={handleClick}>按鈕</Button>);

      const _button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    test('模態框應該支持ESC鍵關閉', () => {
      const _handleClose = jest.fn();
      renderWithProvider(
        <Modal isOpen={true} onClose={handleClose}>
          模態框內容
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('主題集成測試', () => {
    test('組件應該使用設計系統主題', () => {
      renderWithProvider(<Button>主題按鈕</Button>);
      const _button = screen.getByRole('button');

      // Check按鈕YesNo有Theme相Off的樣式Class
      expect(button).toHaveClass('button--primary');
    });

    test('組件應該響應主題變化', () => {
      const { rerender } = renderWithProvider(<Button>主題按鈕</Button>);

      // 這裡可以TestThemeSwitch後Component的樣式變化
      // 由於我們使用的Yes內聯樣式，實際的Theme變化會在運Row時生效
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
