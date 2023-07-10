import { Db } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    getDb(): Db;
  }

  interface FastifyRequest {
    db: Db;
  }
}