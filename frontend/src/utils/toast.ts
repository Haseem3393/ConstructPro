export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;

class ToastManager {
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(message: string, type: ToastType = 'info', duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toastItem: ToastItem = { id, message, type, duration };
    this.listeners.forEach(listener => listener(toastItem));
    return id;
  }

  success(message: string, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000) {
    return this.show(message, 'warning', duration);
  }
}

export const toast = new ToastManager();
