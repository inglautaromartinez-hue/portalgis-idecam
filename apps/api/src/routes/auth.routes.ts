import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';
import { env } from '../config/env';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Credenciales inválidas.' });
    }

    const auth = new AuthService(app.prisma);
    const user = await auth.validateLogin(parsed.data.email, parsed.data.password);

    if (!user) {
      return reply.status(401).send({ error: 'Usuario o contraseña incorrectos.' });
    }

    const token = await reply.jwtSign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    reply.setCookie('portalgis_token', token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
    });

    await new AuditService(app.prisma).log({
      userId: user.id,
      action: 'auth:login',
      entity: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    return {
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
      token,
      author: 'laugis',
    };
  });

  app.get('/auth/me', { preHandler: [app.authenticate] }, async (request) => ({
    ok: true,
    user: request.user,
    author: 'laugis',
  }));

  app.post('/auth/logout', async (_request, reply) => {
    reply.clearCookie('portalgis_token', { path: '/' });
    return { ok: true, author: 'laugis' };
  });
}
