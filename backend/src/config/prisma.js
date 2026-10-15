import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'node:async_hooks';

export const requestContext = new AsyncLocalStorage();

let _standaloneClient = null;
let _standalonePool = null;
let _standaloneConnectionString = null;

function createClientInstance(connectionString) {
  const isHyperdrive = connectionString.includes('hyperdrive') || connectionString.includes('cloudflared');
  const isDirectSupabase = !isHyperdrive && (connectionString.includes('supabase') || connectionString.includes('pooler'));

  const pool = new pg.Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
    ...(isDirectSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  pool.on('error', (err) => {
    console.warn('[pg.Pool Warning]:', err?.message || err);
  });

  const adapter = new PrismaPg(pool);
  const isDev = process.env.NODE_ENV === 'development';
  const logs = isDev ? ['query', 'error', 'warn'] : ['error'];
  const client = new PrismaClient({ adapter, log: logs });
  return { client, pool };
}

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:dummy@localhost:5432/postgres';
  const store = requestContext.getStore();

  if (store) {
    if (!store.has('prisma')) {
      const { client, pool } = createClientInstance(connectionString);
      store.set('prisma', client);
      store.set('pool', pool);
    }
    return store.get('prisma');
  }

  // Fallback for standalone scripts (scripts/set-admin.js, tests, etc.)
  if (!_standaloneClient || _standaloneConnectionString !== connectionString) {
    if (_standalonePool) {
      try { _standalonePool.end().catch(() => {}); } catch {}
    }
    _standaloneConnectionString = connectionString;
    const { client, pool } = createClientInstance(connectionString);
    _standaloneClient = client;
    _standalonePool = pool;
  }
  return _standaloneClient;
}

const prisma = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = client[prop];

    if (typeof value === 'function') {
      return value.bind(client);
    }

    if (value && typeof value === 'object' && !value.then) {
      return new Proxy(value, {
        get(modelTarget, modelProp) {
          const method = modelTarget[modelProp];
          if (typeof method === 'function') {
            return method.bind(modelTarget);
          }
          return method;
        },
      });
    }

    return value;
  },
});

export default prisma;
