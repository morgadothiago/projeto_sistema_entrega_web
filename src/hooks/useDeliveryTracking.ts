'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:2000/gps';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export interface DeliveryTrackingOptions {
  deliveryCode: string;
  token: string;
  enabled: boolean;
  onLocationUpdate?: (location: LocationUpdate) => void;
  onError?: (error: string) => void;
}

export function useDeliveryTracking({
  deliveryCode,
  token,
  enabled,
  onLocationUpdate,
  onError,
}: DeliveryTrackingOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<LocationUpdate | null>(null);

  // Conecta ao WebSocket e entra na room da entrega
  useEffect(() => {
    if (!enabled || !token || !deliveryCode) {
      return;
    }

    // Cria conexão Socket.IO
    const socket = io(WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Event listeners
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);

      // Entra na room da entrega para receber atualizações
      socket.emit('joinRoom', deliveryCode);
    });

    socket.on('connect_error', (err) => {
      const errorMsg = 'Erro de conexão. Tentando reconectar...';
      setError(errorMsg);
      setIsConnected(false);
      onError?.(errorMsg);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      const errorMsg = 'Erro no servidor. Tente novamente.';
      setError(errorMsg);
      onError?.(errorMsg);
    });

    // Listener para confirmação de entrada na room
    socket.on('roomJoined', (response: { event: string; data: string }) => {
      // Room confirmada
    });

    socket.on('roomMessage', (message: string) => {
      // Mensagem da room recebida
    });

    // Listener para resposta de erro do servidor
    socket.on('exception', (error: any) => {
      const errorMsg = error?.message || 'Erro no servidor';
      setError(errorMsg);
      onError?.(errorMsg);
    });

    // 🚀 PRINCIPAL: Listener para atualizações de localização
    socket.on('update-location', (location: LocationUpdate) => {
      setLastLocation(location);
      onLocationUpdate?.(location);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setIsConnected(false);
    };
  }, [enabled, token, deliveryCode, onLocationUpdate, onError]);

  // Força reconexão
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    error,
    lastLocation,
    reconnect,
  };
}
