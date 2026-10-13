import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let _client = null;
let _currentConnectionString = null;

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:dummy@localhost:5432/postgres';

  if (!_client || _currentConnectionString !== connectionString) {
    _currentConnectionString = connectionString;
    const isDev = process.env.NODE_ENV === 'development';
    const logs = isDev ? ['query', 'error', 'warn'] : ['error'];

    try {
      const isRemote = connectionString.includes('supabase.com') || connectionString.includes('sslmode=') || !connectionString.includes('localhost');
      const pool = new pg.Pool({
        connectionString,
        max: 5,
        connectionTimeoutMillis: 10000,
        ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
      });
      const adapter = new PrismaPg(pool);
      _client = new PrismaClient({ adapter, log: logs });
    } catch (err) {
      console.warn('[Prisma] Adapter initialization error:', err.message);
      const fallbackPool = new pg.Pool({ connectionString: 'postgresql://postgres:dummy@localhost:5432/postgres' });
      _client = new PrismaClient({ adapter: new PrismaPg(fallbackPool), log: logs });
    }
  }
  return _client;
}

const prisma = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
