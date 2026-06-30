import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { LocalDataService } from '../services/local-data.service';

const bbox = z.array(z.coerce.number()).length(4).optional();
const filter = z.object({ field: z.string(), operator: z.enum(['contains', 'equals']), value: z.string() });
const geometry = z.object({ type: z.string(), coordinates: z.array(z.unknown()) });
const featureQuery = z.object({ layerId: z.string().min(1), bbox, mapCrs: z.string().optional(), limit: z.coerce.number().int().min(1).max(10000).optional(), propertyName: z.array(z.string().max(200)).max(100).optional(), filters: z.array(filter).max(20).optional(), polygon: geometry.optional(), category: z.string().max(200).optional() });
const statisticsQuery = z.object({ layerId: z.string().min(1), categoryField: z.string().min(1), numericField: z.string().optional(), filters: z.array(filter).optional(), scope: z.enum(['global', 'area']).default('global'), bbox, mapCrs: z.string().optional(), polygon: geometry.optional(), irrigationOnly: z.boolean().optional() });
const crossQuery = z.object({ targetLayerId: z.string().min(1), groupLayerId: z.string().min(1), spatialOperation: z.enum(['within', 'intersects', 'contains']), groupByField: z.string().min(1), metric: z.enum(['count', 'sum', 'avg']), numericField: z.string().optional(), filters: z.array(filter).optional(), scope: z.enum(['global', 'area']).default('global'), bbox, mapCrs: z.string().optional(), polygon: geometry.optional(), irrigationOnly: z.boolean().optional() });

function errorReply(reply: any, error: unknown) {
  const message = error instanceof Error ? error.message : 'Error local desconocido.';
  return reply.status(message === 'SNAPSHOT_NOT_FOUND' ? 404 : 400).send({ error: message === 'SNAPSHOT_NOT_FOUND' ? 'No existe snapshot local para esta capa.' : message, fallback: message === 'SNAPSHOT_NOT_FOUND' ? 'wfs' : null });
}

export async function localRoutes(app: FastifyInstance): Promise<void> {
  const service = new LocalDataService();
  app.get('/local/features', async (request, reply) => {
    const query = request.query as Record<string, string>;
    const parsed = featureQuery.safeParse({ ...query, bbox: query.bbox?.split(','), propertyName: query.propertyName?.split(',') });
    if (!parsed.success) return reply.status(400).send({ error: 'Parametros invalidos.', details: parsed.error.flatten() });
    try { return await service.queryFeatures(parsed.data); } catch (error) { return errorReply(reply, error); }
  });
  app.post('/local/features/query', async (request, reply) => {
    const parsed = featureQuery.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Parametros invalidos.', details: parsed.error.flatten() });
    try { return await service.queryFeatures(parsed.data); } catch (error) { return errorReply(reply, error); }
  });
  app.get('/local/statistics', async (request, reply) => {
    const layerId = (request.query as { layerId?: string }).layerId;
    try { return layerId ? await service.statsSummary(layerId) : await service.catalog(); } catch (error) { return errorReply(reply, error); }
  });
  app.post('/local/statistics/query', async (request, reply) => {
    const parsed = statisticsQuery.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Parametros invalidos.', details: parsed.error.flatten() });
    try { return await service.statistics(parsed.data); } catch (error) { return errorReply(reply, error); }
  });
  app.post('/local/statistics/cross-query', async (request, reply) => {
    const parsed = crossQuery.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Parametros invalidos.', details: parsed.error.flatten() });
    try { return await service.crossStatistics(parsed.data); } catch (error) { return errorReply(reply, error); }
  });
}
