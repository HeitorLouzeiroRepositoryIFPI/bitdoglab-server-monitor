/**
 * Serviço WebSocket para comunicação em tempo real com o backend
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {
      serverStatus: [],
      temperature: [],
      connect: [],
      disconnect: []
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  connect() {
    // Definir o URL do WebSocket com base no ambiente de execução
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = process.env.REACT_APP_API_HOST || window.location.hostname;
    const port = process.env.REACT_APP_API_PORT || '8001';
    const wsUrl = `${protocol}://${host}:${port}/ws/monitor/`;
    
    console.log(`Tentando conectar ao WebSocket: ${wsUrl}`);
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('✅ WebSocket conectado');
      this.reconnectAttempts = 0;
      this.notifyListeners('connect');
    };
    
    this.socket.onclose = (event) => {
      console.log(`❌ WebSocket desconectado: ${event.code} - ${event.reason}`);
      this.notifyListeners('disconnect');
      
      // Tentar reconectar após alguns segundos
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(3000 * this.reconnectAttempts, 15000);
        console.log(`Tentando reconectar em ${delay/1000} segundos (tentativa ${this.reconnectAttempts})`);
        
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      } else {
        console.log('Número máximo de tentativas de reconexão excedido');
      }
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'server_status' || data.message_type === 'server_status') {
          this.notifyListeners('serverStatus', data.data);
        } else if (data.type === 'temperature' || data.message_type === 'temperature') {
          this.notifyListeners('temperature', data.data);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('Erro de WebSocket:', error);
    };
  }
  
  addListener(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].push(callback);
    }
    return () => this.removeListener(eventType, callback);
  }
  
  removeListener(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        listener => listener !== callback
      );
    }
  }
  
  notifyListeners(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => callback(data));
    }
  }
  
  disconnect() {
    clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
    }
  }
}

// Criar uma instância singleton para ser usada em toda a aplicação
const socketService = new WebSocketService();
export default socketService;