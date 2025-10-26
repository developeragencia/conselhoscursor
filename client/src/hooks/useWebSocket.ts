import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  url: string;
  token: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const useWebSocket = ({
  url,
  token,
  onMessage,
  onError,
  onOpen,
  onClose,
  autoReconnect = true,
  reconnectInterval = 3000
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!token) {
      console.log('WebSocket: Token not provided');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected');
      return;
    }

    console.log('WebSocket: Connecting to', url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket: Connected');
      setIsConnected(true);
      
      // Autenticar imediatamente
      ws.send(JSON.stringify({
        type: 'auth',
        token
      }));

      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket: Message received', message.type);

        // Tratar autenticação bem-sucedida
        if (message.type === 'auth_success') {
          setIsAuthenticated(true);
          console.log('WebSocket: Authenticated successfully');
        }

        // Responder pings automaticamente
        if (message.type === 'pong') {
          console.log('WebSocket: Pong received');
        }

        onMessage?.(message);
      } catch (error) {
        console.error('WebSocket: Error parsing message', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket: Error', error);
      setIsConnected(false);
      setIsAuthenticated(false);
      onError?.(error);
    };

    ws.onclose = () => {
      console.log('WebSocket: Closed');
      setIsConnected(false);
      setIsAuthenticated(false);
      onClose?.();

      // Tentar reconectar se habilitado
      if (autoReconnect) {
        console.log(`WebSocket: Reconnecting in ${reconnectInterval}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    wsRef.current = ws;
  }, [url, token, onMessage, onError, onOpen, onClose, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  const send = useCallback((data: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      console.log('WebSocket: Message sent', data.type);
    } else {
      console.warn('WebSocket: Not connected, cannot send message');
    }
  }, []);

  // Conectar ao montar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping periódico para manter conexão viva
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      send({ type: 'ping' });
    }, 25000); // 25 segundos (antes do timeout de 30s do servidor)

    return () => clearInterval(pingInterval);
  }, [isConnected, send]);

  return {
    isConnected,
    isAuthenticated,
    send,
    disconnect,
    reconnect: connect
  };
};

