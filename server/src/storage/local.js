import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { extFor } from './utils.js';

// Stores files on the server's disk and serves them from /uploads.
// Fine for local development or a VM with a persistent disk.
// On hosts with ephemeral disks (Render free, Heroku...) use cloudinary or s3.
export async function createLocalStorage({ localDir, publicBaseUrl }) {
  const dir = path.resolve(localDir);
  await fs.mkdir(dir, { recursive: true });
  const base = publicBaseUrl.replace(/\/$/, '');
  return {
    name: 'local',
    staticDir: dir,
    async save({ buffer, mimetype }) {
      const key = `${randomUUID()}${extFor(mimetype)}`;
      await fs.writeFile(path.join(dir, key), buffer);
      return { url: `${base}/uploads/${key}`, key };
    },
    async remove(url) {
      try {
        const key = path.basename(new URL(url).pathname);
        await fs.rm(path.join(dir, key), { force: true });
      } catch {
        /* ignore malformed urls */
      }
    },
  };
}
