import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { WfsProxyService } from '../services/wfs-proxy.service';

const baseSchema = z.object({
  targetUrl: z.string().url(),
  version: z.string().optional(),
});

const describeSchema = baseSchema.extend({
  typeName: z.string().min(1),
});

const featureSchema = describeSchema.extend({
  bbox: z.string().optional(),
  mapCrs: z.string().optional(),
  layerCrs: z.string().optional(),
  outputFormat: z.string().optional(),
  cqlFilter: z.string().optional(),
  propertyName: z.string().optional(),
  count: z.coerce.number().int().positive().max(10000).optional(),
  startIndex: z.coerce.number().int().nonnegative().optional(),
});

function sendProxyResponse(reply: any, result: { contentType: string; status: number; data: unknown }) {
  return reply.header('Content-Type', result.contentType).status(result.status).send(result.data);
}

export async function wfsRoutes(app: FastifyInstance): Promise<void> {
  const service = new WfsProxyService();

  app.get('/wfs/capabilities', async (request, reply) => {
    const parsed = baseSchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ error: 'Parámetros inválidos.', details: parsed.error.flatten() });

    try {
      const result = await service.getCapabilities(parsed.data);
      return sendProxyResponse(reply, result);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Error WFS.' });
    }
  });

  app.get('/wfs/describe', async (request, reply) => {
    const parsed = describeSchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ error: 'Parámetros inválidos.', details: parsed.error.flatten() });

    try {
      const result = await service.describeFeatureType(parsed.data);
      return sendProxyResponse(reply, result);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Error WFS.' });
    }
  });

  app.get('/wfs/feature', async (request, reply) => {
    const parsed = featureSchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ error: 'Parámetros inválidos.', details: parsed.error.flatten() });

    try {
      const result = await service.getFeature(parsed.data);
      return sendProxyResponse(reply, result);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Error WFS.' });
    }
  });
}
