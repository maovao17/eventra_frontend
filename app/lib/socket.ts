import { io, Socket } from 'socket.io-client';
import type { Booking, Notification } from '@/app/types/eventra';

const endpoint = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!endpoint) {
  throw new Error("NEXT_PUBLIC_API_URL is NOT set");
}

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(endpoint, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
      auth: { token: null },
    });
  }

  return socket;
};

export const syncSocketAuth = (token: string | null) => {
  const socketInstance = getSocket();
  const nextToken = token?.trim() || null;
  const currentToken =
    typeof socketInstance.auth === 'object' && socketInstance.auth
      ? String((socketInstance.auth as { token?: string | null }).token ?? '')
      : '';

  if (!nextToken) {
    socketInstance.auth = { token: null };
    if (socketInstance.connected || socketInstance.active) {
      socketInstance.disconnect();
    }
    return socketInstance;
  }

  socketInstance.auth = { token: nextToken };

  if (socketInstance.connected && currentToken === nextToken) {
    return socketInstance;
  }

  if (socketInstance.connected || socketInstance.active) {
    socketInstance.disconnect();
  }

  socketInstance.connect();
  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.auth = { token: null };
  socket.disconnect();
};

export const onSocketConnect = (handler: () => void) => {
  const socketInstance = getSocket();
  socketInstance.on('connect', handler);

  return () => {
    socketInstance.off('connect', handler);
  };
};

export const onSocketDisconnect = (handler: () => void) => {
  const socketInstance = getSocket();
  socketInstance.on('disconnect', handler);
  socketInstance.on('connect_error', handler);

  return () => {
    socketInstance.off('disconnect', handler);
    socketInstance.off('connect_error', handler);
  };
};

export const onBookingStatusUpdated = (handler: (booking: Partial<Booking>) => void) => {
  const socketInstance = getSocket();
  socketInstance.off('bookingStatusUpdated');
  socketInstance.on('bookingStatusUpdated', handler);
};

export const onNotificationCreated = (handler: (notification: Notification) => void) => {
  const socketInstance = getSocket();
  socketInstance.off('notificationCreated');
  socketInstance.on('notificationCreated', handler);
};

export const offAll = () => {
  getSocket().off('bookingStatusUpdated');
  getSocket().off('notificationCreated');
};
