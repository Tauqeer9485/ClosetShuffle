import { io } from 'socket.io-client';
import { API_URL, getToken } from './api.js';

// Real-time chat connection. If the host can't keep sockets open (serverless),
// skip this and poll GET /api/swaps/:id/messages?after=... every few seconds instead.
export function connectChat() {
  return io(API_URL, { auth: { token: getToken() }, transports: ['websocket', 'polling'] });
}
