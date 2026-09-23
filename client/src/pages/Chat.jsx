// TODO (Chat page) for /swaps/:id/chat
//  1. GET /api/swaps/:id            -> header with both items and the current status
//  2. GET /api/swaps/:id/messages   -> history
//  3. Live updates: connectChat() from ../realtime.js
//       socket.emit('swap:join', swapId, ack)
//       socket.on('message:new', (m) => append if id not already shown)
//       socket.emit('message:send', { swapId, content }, ack)
//     No sockets on your host? Poll GET /api/swaps/:id/messages?after=<last createdAt> and POST the same path to send.
//  4. Buttons per role: PATCH /api/swaps/:id/status { status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' }
export default function Chat() {
  return <h1>Swap chat</h1>;
}
