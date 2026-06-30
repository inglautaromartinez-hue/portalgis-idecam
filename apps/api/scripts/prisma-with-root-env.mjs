import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));

// ponytail: evita sumar dotenv-cli solo para que Prisma lea el .env raiz.
dotenv.config({ path: resolve(here, '../../../.env') });

const bin = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const result = spawnSync(bin, process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
