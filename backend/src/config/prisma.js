import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let _client = null;
let _currentConnectionString = null;
let _currentPool = null;

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:dummy@localhost:5432/postgres';

  if (!_client || _currentConnectionString !== connectionString) {
    if (_currentPool) {
      try {
        _currentPool.end().catch(() => {});
      } catch {}
    }

    _currentConnectionString = connectionString;
    const isDev = process.env.NODE_ENV === 'development';
    const logs = isDev ? ['query', 'error', 'warn'] : ['error'];

    try {
      const isDirectSupabase = connectionString.includes('supabase');
      const pool = new pg.Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ...(isDirectSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
      });

      pool.on('error', (err) => {
        console.warn('[pg.Pool Idle Client Error]:', err?.message || err);
      });

      _currentPool = pool;
      const adapter = new PrismaPg(pool);
      _client = new PrismaClient({ adapter, log: logs });
    } catch (err) {
      console.warn('[Prisma] Adapter initialization error:', err.message);
      const fallbackPool = new pg.Pool({
        connectionString: 'postgresql://postgres:dummy@localhost:5432/postgres',
        max: 1,
      });
      fallbackPool.on('error', () => {});
      _currentPool = fallbackPool;
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
