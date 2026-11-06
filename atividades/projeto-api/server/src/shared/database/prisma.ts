import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client.js';

const currentFile = fileURLToPath(import.meta.url);
const serverRoot = path.resolve(path.dirname(currentFile), '../../..');

config({ path: path.join(serverRoot, '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não foi configurada no arquivo .env do servidor.');
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

export default prisma;
