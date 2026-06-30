import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { env } from '../config/env';

export const securityPlugin = fp(async (app) => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.length ? env.CORS_ORIGIN : true,
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'portalgis_token',
      signed: false,
    },
  });

  await app.register(rateLimit, {
    max: 180,
    timeWindow: '1 minute',
  });

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'No autenticado.' });
    }
  });
});
