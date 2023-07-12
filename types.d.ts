import { Db } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }

  interface FastifyRequest {
    db: Db;
  }
}