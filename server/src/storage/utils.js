export const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
export const extFor = (mimetype) => EXT[mimetype] || '.bin';
