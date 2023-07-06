import { FastifyInstance } from 'fastify';
import { Db, MongoClient } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    getDb(): Db;
  }

  interface FastifyRequest {
    db: Db;
  }
}