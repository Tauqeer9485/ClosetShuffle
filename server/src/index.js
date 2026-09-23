import http from 'node:http';
import { config } from './config.js';
import { connectDb } from './db/index.js';
import { initStorage } from './storage/index.js';
import { createApp } from './app.js';
import { attachSocket } from './realtime/socket.js';
import { bootstrapAdmin } from './services/bootstrap.js';

const db = await connectDb();
const storage = await initStorage();
await bootstrapAdmin();

const app = createApp({ staticDir: storage.staticDir });
const server = http.createServer(app);
attachSocket(server, app);

server.listen(config.port, () => {
  console.log(`ClothSwap API on :${config.port}  db=${db.type}  storage=${storage.name}`);
});

async function shutdown() {
  server.close();
  await db.close().catch(() => {});
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
