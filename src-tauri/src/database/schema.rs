use crate::error::AppError;
use rusqlite::Connection;

pub const CURRENT_SCHEMA_VERSION: i32 = 1;

pub fn create_tables(conn: &Connection) -> Result<(), AppError> {
    conn.execute_batch(
        "
        -- 数据库版本记录表
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        );

        -- 系统与用户通用配置表 (Key-Value 存储)
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        -- 示范业务数据表 (Records)
        CREATE TABLE IF NOT EXISTS records (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'active',
            tags TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
        CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
        ",
    )
    .map_err(|e| AppError::Database(format!("Create tables failed: {e}")))?;

    Ok(())
}
