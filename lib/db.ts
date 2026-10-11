import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const isD1 = process.env.DB_DRIVER === 'd1' || Boolean(process.env.CLOUDFLARE_D1_DATABASE_ID);

function normalizeSql(sql: string): string {
  if (!isD1) return sql;
  return sql
    .replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+24\s+HOUR\s*\)/gi, "datetime('now', '-24 hours')")
    .replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "datetime('now', '-$1 days')")
    .replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");
}

async function queryD1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CF_D1_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  // 1. Worker / Pages Runtime binding
  const globalDb = (globalThis as any).DB || (process.env as any).DB;
  if (globalDb && typeof globalDb.prepare === 'function') {
    const stmt = globalDb.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.all();
    return (res.results || []) as T[];
  }

  // 2. HTTP REST API
  if (!accountId || !dbId || !apiToken) {
    throw new Error('Cloudflare D1 credentials missing in environment variables.');
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
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CF_D1_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  // 1. Worker / Pages Runtime binding
  const globalDb = (globalThis as any).DB || (process.env as any).DB;
  if (globalDb && typeof globalDb.prepare === 'function') {
    const stmt = globalDb.prepare(sql);
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
  if (!accountId || !dbId || !apiToken) {
    throw new Error('Cloudflare D1 credentials missing in environment variables.');
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
  if (isD1) {
    return queryD1<T>(norm, params);
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
  if (isD1) {
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
