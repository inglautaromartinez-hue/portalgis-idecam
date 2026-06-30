import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../../.env' });
dotenv.config();

const envSchema = z.object({
  APP_AUTHOR: z.string().default('laugis'),
  APP_NAME: z.string().default('PORTALGIS - IDECAM'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  WFS_ALLOWLIST: z
    .string()
    .default('wms.ign.gob.ar,geonode-cam.marketsis.com.ar')
    .transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean)),
  CORS_ORIGIN: z
    .string()
    .optional()
    .transform((value) => value?.split(',').map((item) => item.trim()).filter(Boolean) ?? []),
  WFS_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  WFS_MAX_RESPONSE_BYTES: z.coerce.number().int().positive().default(25_000_000),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
