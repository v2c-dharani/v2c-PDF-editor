-- =========================================================
-- V2C PDF Platform - SQLite Database Schema (Zero Configuration)
-- =========================================================

-- 1. Task Histories Table (Logs all PDF operations anonymously)
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

CREATE INDEX IF NOT EXISTS idx_task_session ON task_histories (session_id);
CREATE INDEX IF NOT EXISTS idx_task_tool ON task_histories (tool_id);
CREATE INDEX IF NOT EXISTS idx_task_created ON task_histories (created_at DESC);

-- 2. Shared Documents Table (For the Share PDF tool with auto-expiry)
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

CREATE UNIQUE INDEX IF NOT EXISTS uk_shared_slug ON shared_documents (slug);
CREATE INDEX IF NOT EXISTS idx_shared_expires ON shared_documents (expires_at);
