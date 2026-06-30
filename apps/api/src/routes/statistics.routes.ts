import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CrossStatisticsService } from '../services/cross-statistics.service';
import { StatisticsService } from '../services/statistics.service';

const statisticsFilterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['contains', 'equals']).default('contains'),
  value: z.string().default(''),
});

const statisticsQuerySchema = z.object({
  layerId: z.string().min(1),
  bbox: z.array(z.number()).length(4),
  mapCrs: z.string().default('EPSG:3857'),
  categoryField: z.string().min(1),
  numericField: z.string().optional(),
  filters: z.array(statisticsFilterSchema).default([]),
  irrigationOnly: z.boolean().default(false),
});

const crossStatisticsQuerySchema = z.object({
  targetLayerId: z.string().min(1),
  groupLayerId: z.string().min(1),
  bbox: z.array(z.number()).length(4),
  mapCrs: z.string().default('EPSG:3857'),
  spatialOperation: z.enum(['within', 'intersects', 'contains']).default('within'),
  groupByField: z.string().min(1),
  metric: z.enum(['count', 'sum', 'avg']).default('count'),
  numericField: z.string().optional(),
  filters: z.array(statisticsFilterSchema).default([]),
  irrigationOnly: z.boolean().default(false),
});

export async function statisticsRoutes(app: FastifyInstance): Promise<void> {
  const service = new StatisticsService();
  const crossService = new CrossStatisticsService();

  app.post('/statistics/query', async (request, reply) => {
    const parsed = statisticsQuerySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Parametros invalidos.', details: parsed.error.flatten() });

    const layer = await app.prisma.layer.findUnique({ where: { id: parsed.data.layerId } });
    if (!layer) return reply.status(404).send({ error: 'Capa no encontrada.' });
    if (layer.provider !== 'WFS') return reply.status(400).send({ error: 'Las estadisticas consultadas solo estan disponibles para capas WFS.' });

    try {
      return await service.query({ ...parsed.data, layer });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Error al consultar estadisticas.' });
    }
  });

  app.post('/statistics/cross-query', async (request, reply) => {
    const parsed = crossStatisticsQuerySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Parametros invalidos.', details: parsed.error.flatten() });

    const [targetLayer, groupLayer] = await Promise.all([
      app.prisma.layer.findUnique({ where: { id: parsed.data.targetLayerId } }),
      app.prisma.layer.findUnique({ where: { id: parsed.data.groupLayerId } }),
    ]);
    if (!targetLayer) return reply.status(404).send({ error: 'Capa objetivo no encontrada.' });
    if (!groupLayer) return reply.status(404).send({ error: 'Capa de agrupamiento no encontrada.' });
    if (targetLayer.provider !== 'WFS' || groupLayer.provider !== 'WFS') {
      return reply.status(400).send({ error: 'Las estadisticas cruzadas solo estan disponibles para capas WFS.' });
    }

    try {
      return await crossService.query({ ...parsed.data, targetLayer, groupLayer });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Error al consultar estadisticas cruzadas.' });
    }
  });
}
