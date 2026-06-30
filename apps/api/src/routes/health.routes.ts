import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    ok: true,
    service: 'PORTALGIS - IDECAM API',
    author: 'laugis',
    timestamp: new Date().toISOString(),
  }));

  app.get('/health/db', async (request, reply) => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: 'up', author: 'laugis' };
    } catch (error) {
      request.log.error(error);
      return reply.status(503).send({ ok: false, db: 'down' });
    }
  });
}
