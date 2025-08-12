import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  getNotifications() {
    return this.notifications.asReadonly();
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000): void {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      duration
    };

    // Adiciona a notificação
    this.notifications.update(notifications => [...notifications, notification]);

    // Remove automaticamente após o duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  }

  clear(): void {
    this.notifications.set([]);
  }

  // Métodos de conveniência
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  // Métodos alternativos mais claros
  showSuccess(message: string, duration?: number): void {
    this.success(message, duration);
  }

  showError(message: string, duration?: number): void {
    this.error(message, duration);
  }

  showInfo(message: string, duration?: number): void {
    this.info(message, duration);
  }

  showWarning(message: string, duration?: number): void {
    this.warning(message, duration);
  }
}
