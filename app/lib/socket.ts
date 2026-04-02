import { io, Socket } from 'socket.io-client';
import type { Booking, Notification } from '@/app/types/eventra';

const endpoint = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:3002';

let socket: Socket | null = null;

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
};

export const getSocket = () => {
  if (!socket) {
    const token = getStoredAuthToken();

    socket = io(endpoint, {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token },
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] connect_error', error);
    });
  }

  return socket;
};

export const onBookingStatusUpdated = (handler: (booking: Partial<Booking>) => void) => {
  getSocket().on('bookingStatusUpdated', handler);
};

export const onNotificationCreated = (handler: (notification: Notification) => void) => {
  getSocket().on('notificationCreated', handler);
};

export const offAll = () => {
  getSocket().off('bookingStatusUpdated');
  getSocket().off('notificationCreated');
};
