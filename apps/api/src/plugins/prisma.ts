import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

export const prismaPlugin = fp(async (app) => {
  const prisma = new PrismaClient({
    log: app.log.level === 'debug' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  });

  await prisma.$connect();

  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
