import { io, Socket } from 'socket.io-client';
import Config from 'react-native-config';
import { storage } from '@utils/storage';
import { STORAGE_KEYS } from '@utils/constants';

const WS_URL = Config.WS_URL || 'ws://localhost:80';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  // Vehicle tracking
  trackVehicle(vehicleId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('track:vehicle', { vehicleId });
    this.socket.on(`vehicle:${vehicleId}:location`, callback);
  }

  stopTrackingVehicle(vehicleId: string) {
    if (!this.socket) return;

    this.socket.emit('track:vehicle:stop', { vehicleId });
    this.socket.off(`vehicle:${vehicleId}:location`);
  }

  // Booking updates
  subscribeToBookingUpdates(bookingId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on(`booking:${bookingId}:update`, callback);
  }

  unsubscribeFromBookingUpdates(bookingId: string) {
    if (!this.socket) return;
    this.socket.off(`booking:${bookingId}:update`);
  }

  // Notifications
  subscribeToNotifications(callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('notification', callback);
  }

  unsubscribeFromNotifications() {
    if (!this.socket) return;
    this.socket.off('notification');
  }

  // Generic event emitter
  emit(event: string, data: any) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // Generic event listener
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on(event, callback);
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
