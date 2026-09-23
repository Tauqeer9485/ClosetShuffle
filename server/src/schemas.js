import { z } from 'zod';

// Optional number that also accepts numeric strings (multipart forms / query strings)
export const optNum = (min, max) =>
  z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.coerce.number().min(min).max(max).optional(),
  );

export const lat = () => optNum(-90, 90);
export const lng = () => optNum(-180, 180);
