import { config } from '../config';

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private notificationHandlers: ((data: any) => void)[] = [];

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = new WebSocket(`${config.wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        this.messageHandlers.forEach(handler => handler(data));
      } else if (data.type === 'notification') {
        this.notificationHandlers.forEach(handler => handler(data));
      }
    };

    this.socket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
      // Intentar reconectar después de 5 segundos
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onNotification(handler: (data: any) => void) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
    };
  }
}

export const websocketService = new WebSocketService(); 