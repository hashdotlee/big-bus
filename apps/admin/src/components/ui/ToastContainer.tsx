'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([]);

  const showToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        id,
        onClose: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      },
    ]);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col items-end space-y-4 p-6">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
