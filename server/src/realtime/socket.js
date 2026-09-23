import { Server } from 'socket.io';
import { config } from '../config.js';
import { userFromToken } from '../middleware/auth.js';
import { assertParticipant, postMessage } from '../services/swapService.js';

// Real-time chat. Needs a long-running server (VM, Docker, Render...).
// On serverless hosts, the REST endpoints /api/swaps/:id/messages work with polling instead.
export function attachSocket(httpServer, app) {
  const io = new Server(httpServer, { cors: { origin: config.corsOrigins, credentials: true } });

  io.use(async (socket, next) => {
    try {
      socket.data.user = await userFromToken(socket.handshake.auth?.token);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('swap:join', async (swapId, ack) => {
      try {
        await assertParticipant(swapId, socket.data.user);
        socket.join(`swap:${swapId}`);
        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e.message });
      }
    });

    socket.on('message:send', async (payload, ack) => {
      try {
        const { swapId, content } = payload || {};
        const message = await postMessage({ swapId, user: socket.data.user, content });
        io.to(`swap:${swapId}`).emit('message:new', message);
        ack?.({ ok: true, message });
      } catch (e) {
        ack?.({ ok: false, error: e.message });
      }
    });
  });

  app.set('io', io);
  return io;
}
