export async function query<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.all();
    return (res.results || []) as T[];
  } catch (err: any) {
    console.error(`D1 Query Error: ${err.message} [SQL: ${sql}]`, params);
    throw err;
  }
}

export async function queryOne<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<{ affectedRows: number; lastRowId: number | null }> {
  try {
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.run();
    return {
      affectedRows: res.meta?.changes ?? 0,
      lastRowId: res.meta?.last_row_id ?? null,
    };
  } catch (err: any) {
    console.error(`D1 Execute Error: ${err.message} [SQL: ${sql}]`, params);
    throw err;
  }
}
