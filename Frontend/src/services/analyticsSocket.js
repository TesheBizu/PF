import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? undefined
  : import.meta.env.VITE_SOCKET_URL || 'https://pf-o6tc.onrender.com';

let analyticsSocket = null;

function getAnalyticsSocket() {
  if (analyticsSocket?.connected) return analyticsSocket;
  if (!analyticsSocket) {
    analyticsSocket = io(SOCKET_URL ? `${SOCKET_URL}/analytics` : '/analytics', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 10,
    });
  }
  return analyticsSocket;
}

export function emitAnalyticsEvent(type, data = {}) {
  try {
    const socket = getAnalyticsSocket();
    if (socket?.connected) {
      socket.emit('analytics:event', { type, ...data });
    }
  } catch (_) {}
}

export function emitPageView(path, data = {}) {
  try {
    const socket = getAnalyticsSocket();
    if (socket?.connected) {
      socket.emit('analytics:pageview', { path, ...data });
    }
  } catch (_) {}
}

export function emitInteraction(type, data = {}) {
  try {
    const socket = getAnalyticsSocket();
    if (socket?.connected) {
      socket.emit('analytics:interaction', { type, ...data });
    }
  } catch (_) {}
}

export function disconnectAnalyticsSocket() {
  if (analyticsSocket) {
    analyticsSocket.disconnect();
    analyticsSocket = null;
  }
}
