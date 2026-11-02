import { NextRequest, NextResponse } from 'next/server';
import { runSqlite, querySqlite, clearAllTaskHistories, purgeExpiredRecords } from '@/lib/sqlite';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST: Log temporary processing task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolId, toolName, fileName, fileSize, status = 'COMPLETED', sessionId = null } = body;

    if (!toolId || !toolName || !fileName) {
      return NextResponse.json({ error: 'Missing required task metadata' }, { status: 400 });
    }

    // Sanitize filename to prevent header / log injection
    const cleanFileName = String(fileName).replace(/[\r\n\t]/g, '').slice(0, 255);
    const taskId = crypto.randomUUID();

    try {
      runSqlite(
        `INSERT INTO task_histories (id, session_id, tool_id, tool_name, file_name, file_size, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [taskId, sessionId, toolId, toolName, cleanFileName, Math.max(0, Number(fileSize) || 0), status]
      );
      return NextResponse.json({ success: true, taskId });
    } catch (dbErr: any) {
      console.warn('SQLite task logging note:', dbErr.message);
      return NextResponse.json({ success: true, taskId, note: 'Processed client-side' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// GET: Retrieve recent non-expired tasks (auto-purged after 5 minutes)
export async function GET() {
  try {
    purgeExpiredRecords(300); // 5 min TTL
    const rows = querySqlite(
      `SELECT id, tool_id, tool_name, file_name, file_size, status, created_at 
       FROM task_histories 
       ORDER BY created_at DESC 
       LIMIT 10`
    );
    return NextResponse.json({ tasks: rows || [] });
  } catch (dbErr: any) {
    return NextResponse.json({ tasks: [], note: 'Database offline' });
  }
}

// DELETE: Clear all recent history on demand
export async function DELETE() {
  try {
    clearAllTaskHistories();
    return NextResponse.json({ success: true, message: 'All temporary task histories cleared.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not clear tasks' }, { status: 500 });
  }
}
