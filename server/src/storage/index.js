import { config } from '../config.js';

/**
 * Every storage driver returns:  { name, save({buffer, mimetype}) -> {url,key}, remove(url), staticDir? }
 * Switch drivers with STORAGE_DRIVER=local|cloudinary|s3. To add another one, create a driver
 * with the same methods and add a case below.
 */
let storage;

export async function initStorage() {
  if (storage) return storage;
  const s = config.storage;
  switch (s.driver) {
    case 'local': {
      const { createLocalStorage } = await import('./local.js');
      storage = await createLocalStorage(s);
      break;
    }
    case 'cloudinary': {
      const { createCloudinaryStorage } = await import('./cloudinary.js');
      storage = await createCloudinaryStorage(s.cloudinary);
      break;
    }
    case 's3': {
      const { createS3Storage } = await import('./s3.js');
      storage = await createS3Storage(s.s3);
      break;
    }
    default:
      throw new Error(`Unsupported STORAGE_DRIVER "${s.driver}". Use "local", "cloudinary" or "s3".`);
  }
  return storage;
}

export function getStorage() {
  if (!storage) throw new Error('Storage not initialised yet. Call initStorage() first.');
  return storage;
}
