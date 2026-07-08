import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
  ? undefined
  : import.meta.env.VITE_SOCKET_URL || 'https://pf-o6tc.onrender.com';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
