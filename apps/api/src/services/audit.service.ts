import type { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

export class AuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async log(input: {
    userId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    details?: unknown;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: (input.details ?? {}) as object,
        createdBy: env.APP_AUTHOR,
      },
    });
  }
}
