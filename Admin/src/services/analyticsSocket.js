import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? undefined
  : import.meta.env.VITE_SOCKET_URL || 'https://pf-o6tc.onrender.com';

let analyticsSocket = null;
let statsCallback = null;

export function connectAnalyticsSocket(onStats) {
  if (analyticsSocket?.connected) {
    if (onStats) statsCallback = onStats;
    return analyticsSocket;
  }

  statsCallback = onStats;

  analyticsSocket = io(SOCKET_URL ? `${SOCKET_URL}/analytics` : '/analytics', {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity,
  });

  analyticsSocket.on('connect', () => {
    console.log('[Analytics Socket] Connected:', analyticsSocket.id);
  });

  analyticsSocket.on('analytics:stats', (stats) => {
    if (statsCallback) statsCallback(stats);
  });

  analyticsSocket.on('disconnect', () => {
    console.log('[Analytics Socket] Disconnected');
  });

  return analyticsSocket;
}

export function disconnectAnalyticsSocket() {
  if (analyticsSocket) {
    analyticsSocket.disconnect();
    analyticsSocket = null;
    statsCallback = null;
  }
}
