import path from 'path';
import fs from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var sqliteDb: any | undefined;
}

const DB_DIR = path.join(process.cwd(), 'database');
const DB_PATH = path.join(DB_DIR, 'v2c_pdf.sqlite');

/**
 * Get or initialize the SQLite database connection using Node's native SQLite engine.
 */
export function getDb(): any {
  if (!global.sqliteDb) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Dynamic runtime require prevents Next.js / Webpack build-time tracing stalls
    const { DatabaseSync } = eval('require')('node:sqlite');
    const db = new DatabaseSync(DB_PATH);

    // Initialize Schema with automatic cleanup support
    db.exec(`
      CREATE TABLE IF NOT EXISTS task_histories (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        tool_id TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'COMPLETED',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shared_documents (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        access_passcode TEXT,
        download_count INTEGER NOT NULL DEFAULT 0,
        max_downloads INTEGER,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_task_created ON task_histories (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_task_tool ON task_histories (tool_id);
      CREATE INDEX IF NOT EXISTS idx_shared_slug ON shared_documents (slug);
    `);

    global.sqliteDb = db;
  }

  return global.sqliteDb;
}

/**
 * Automatically purge expired records to ensure zero permanent storage buildup.
 * Default retention is 5 minutes (300 seconds).
 */
export function purgeExpiredRecords(maxAgeSeconds = 300): void {
  try {
    const db = getDb();
    // Delete task histories older than the retention threshold
    const stmt = db.prepare(
      `DELETE FROM task_histories WHERE created_at < datetime('now', '-' || ? || ' seconds')`
    );
    stmt.run(maxAgeSeconds);

    // Delete expired shared documents
    const docStmt = db.prepare(
      `DELETE FROM shared_documents WHERE expires_at < datetime('now')`
    );
    docStmt.run();
  } catch (err: any) {
    // Non-blocking cleanup
  }
}

/**
 * Clear all task histories immediately on user request.
 */
export function clearAllTaskHistories(): void {
  try {
    const db = getDb();
    db.exec(`DELETE FROM task_histories;`);
  } catch (err: any) {
    console.warn('Could not clear task histories:', err.message);
  }
}

/**
 * Run a parameterized query that returns rows (SELECT), auto-purging old records first.
 */
export function querySqlite<T = any>(sql: string, params: any[] = []): T[] {
  try {
    purgeExpiredRecords();
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  } catch (err: any) {
    console.warn('SQLite query note:', err.message);
    return [];
  }
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement, auto-purging old records first.
 */
export function runSqlite(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
  try {
    purgeExpiredRecords();
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (err: any) {
    console.warn('SQLite execution note:', err.message);
    return { changes: 0, lastInsertRowid: 0 };
  }
}

/**
 * Backward-compatible query wrapper returning [rows].
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<[T[], any]> {
  const trimmed = sql.trim().toUpperCase();
  if (trimmed.startsWith('SELECT')) {
    const rows = querySqlite<T>(sql, params);
    return [rows, null];
  } else {
    const res = runSqlite(sql, params);
    return [[res as any], null];
  }
}
