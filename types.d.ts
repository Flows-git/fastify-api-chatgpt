import { Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }

  interface FastifyRequest {
    db: Db;
  }
}

declare global {
  var mongo: MongoMemoryServer
}