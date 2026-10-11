import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const DEFAULT_ACCOUNT_ID = 'cea2cd02060a70151f8c3690f1163cd9';
const DEFAULT_DB_ID = '8b1a0242-30c0-43e9-87c2-2932f25a1bcb';

function isUsingD1(): boolean {
  // Always default to Cloudflare D1 unless explicitly set to mysql
  if (process.env.DB_DRIVER === 'mysql') return false;
  return true;
}

function normalizeSql(sql: string): string {
  if (!isUsingD1()) return sql;
  return sql
    .replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+24\s+HOUR\s*\)/gi, "datetime('now', '-24 hours')")
    .replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "datetime('now', '-$1 days')")
    .replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");
}

async function getD1Binding(): Promise<any> {
  // 1. Worker / Pages Runtime binding
  const globalDb = (globalThis as any).DB || (process.env as any).DB;
  if (globalDb && typeof globalDb.prepare === 'function') {
    return globalDb;
  }

  // 2. OpenNext Cloudflare Context
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const cf = await getCloudflareContext({ async: true });
    const cfEnv = cf?.env as any;
    if (cfEnv?.DB && typeof cfEnv.DB.prepare === 'function') {
      return cfEnv.DB;
    }
  } catch {
    // Ignore when running outside Cloudflare worker runtime
  }

  return null;
}

async function queryD1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // 1. Try native D1 binding
  const binding = await getD1Binding();
  if (binding) {
    const stmt = binding.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.all();
    return (res.results || []) as T[];
  }

  // 2. HTTP REST API
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID || DEFAULT_DB_ID;
  const apiToken = process.env.CF_D1_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    console.warn('D1 Query skipped: CF_D1_API_TOKEN not set in environment.');
    return [];
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params: params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p)),
    }),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.[0]?.message || 'Unknown Cloudflare D1 query error';
    throw new Error(`D1 Query Error: ${msg} [SQL: ${sql}]`);
  }

  return (data.result?.[0]?.results || []) as T[];
}

async function executeD1(sql: string, params: any[] = []): Promise<any> {
  // 1. Try native D1 binding
  const binding = await getD1Binding();
  if (binding) {
    const stmt = binding.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.run();
    return {
      affectedRows: res.meta?.changes || 0,
      insertId: res.meta?.last_row_id || 0,
      changes: res.meta?.changes || 0,
      lastInsertRowid: res.meta?.last_row_id || 0,
    };
  }

  // 2. HTTP REST API
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID || DEFAULT_DB_ID;
  const apiToken = process.env.CF_D1_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    throw new Error('Cloudflare D1 API Token missing in environment.');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params: params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p)),
    }),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.[0]?.message || 'Unknown Cloudflare D1 execute error';
    throw new Error(`D1 Execute Error: ${msg} [SQL: ${sql}]`);
  }

  const meta = data.result?.[0]?.meta;
  return {
    affectedRows: meta?.changes || 0,
    insertId: meta?.last_row_id || 0,
    changes: meta?.changes || 0,
    lastInsertRowid: meta?.last_row_id || 0,
  };
}

function getMysqlPool(): mysql.Pool {
  if (global._mysqlPool) return global._mysqlPool;
  const p = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'sukamcd',
    password: process.env.DB_PASSWORD || 'fabian2009',
    database: process.env.DB_NAME || 'mcdhub_db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  if (process.env.NODE_ENV !== 'production') {
    global._mysqlPool = p;
  }
  return p;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const norm = normalizeSql(sql);
  if (isUsingD1()) {
    try {
      return await queryD1<T>(norm, params);
    } catch (err: any) {
      console.warn('D1 Query Warning (fallback to empty list):', err.message);
      return [];
    }
  }
  const pool = getMysqlPool();
  const [rows] = await pool.query(norm, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  const norm = normalizeSql(sql);
  if (isUsingD1()) {
    return executeD1(norm, params);
  }
  const pool = getMysqlPool();
  const [result] = await pool.execute(norm, params);
  return result;
}

export default {
  query,
  queryOne,
  execute,
};
