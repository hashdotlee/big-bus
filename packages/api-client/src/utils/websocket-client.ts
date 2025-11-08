import { getToken } from '../interceptors/auth.interceptor';

export type WebSocketEventHandler = (data: any) => void;

export interface WebSocketConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config,
    };
  }

  connect(): void {
    this.isIntentionallyClosed = false;
    const token = getToken();
    const wsUrl = token
      ? `${this.config.url}?token=${token}`
      : this.config.url;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.emit('connected', {});
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { event: eventName, payload } = data;

        if (eventName) {
          this.emit(eventName, payload);
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      this.emit('disconnected', {});

      if (this.config.autoReconnect && !this.isIntentionallyClosed) {
        this.attemptReconnect();
      }
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this.emit('reconnect_failed', {});
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting... (Attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  send(event: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    } else {
      console.warn('[WebSocket] Cannot send message - connection not open');
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Tracking-specific WebSocket client
export class TrackingWebSocketClient extends WebSocketClient {
  constructor(baseUrl: string = 'ws://localhost/api/tracking') {
    super({ url: baseUrl });
  }

  trackVehicle(vehicleId: string): void {
    this.send('track_vehicle', { vehicleId });
  }

  stopTrackingVehicle(vehicleId: string): void {
    this.send('stop_tracking_vehicle', { vehicleId });
  }

  onLocationUpdate(handler: (data: {
    vehicleId: string;
    location: {
      lat: number;
      lng: number;
      speed: number;
      heading: number;
      timestamp: string;
    };
  }) => void): void {
    this.on('location_update', handler);
  }

  onVehicleStatusChange(handler: (data: {
    vehicleId: string;
    status: string;
  }) => void): void {
    this.on('status_change', handler);
  }
}
