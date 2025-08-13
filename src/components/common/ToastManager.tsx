import React, { useState, useCallback } from 'react';
import { Toast, ToastProps } from './Toast';

interface ToastItem extends Omit<ToastProps, 'visible' | 'onClose'> {
  id: string;
}

interface ToastManagerProps {
  children: React.ReactNode;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toastProps: Omit<ToastProps, 'visible' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastItem = {
      ...toastProps,
      id
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 將 showToast 方法添加到全局對象中，以便在其他地方使用
  React.useEffect(() => {
    (global as any).showToast = showToast;
    return () => {
      delete (global as any).showToast;
    };
  }, [showToast]);

  return (
    <>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          visible={true}
          onClose={() => hideToast(toast.id)}
          {...toast}
        />
      ))}
    </>
  );
};

// 導出便捷方法
export const showToast = (props: Omit<ToastProps, 'visible' | 'onClose'>) => {
  if ((global as any).showToast) {
    (global as any).showToast(props);
  }
};

export const showSuccessToast = (message: string, duration?: number) => {
  showToast({ message, type: 'success', ...(duration && { duration }) });
};

export const showErrorToast = (message: string, duration?: number) => {
  showToast({ message, type: 'error', ...(duration && { duration }) });
};

export const showWarningToast = (message: string, duration?: number) => {
  showToast({ message, type: 'warning', ...(duration && { duration }) });
};

export const showInfoToast = (message: string, duration?: number) => {
  showToast({ message, type: 'info', ...(duration && { duration }) });
};
