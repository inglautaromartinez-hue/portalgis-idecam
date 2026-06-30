import Fastify from 'fastify';
import { env } from './config/env';
import { prismaPlugin } from './plugins/prisma';
import { securityPlugin } from './plugins/security';
import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import { catalogRoutes } from './routes/catalog.routes';
import { statisticsRoutes } from './routes/statistics.routes';
import { wfsRoutes } from './routes/wfs.routes';
import { localRoutes } from './routes/local.routes';

async function main(): Promise<void> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
  });

  await app.register(securityPlugin);
  await app.register(prismaPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(catalogRoutes);
  await app.register(statisticsRoutes);
  await app.register(wfsRoutes);
  await app.register(localRoutes);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(500).send({
      error: 'Error interno del servidor.',
      author: 'laugis',
    });
  });

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
