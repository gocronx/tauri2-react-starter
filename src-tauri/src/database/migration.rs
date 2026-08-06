use crate::database::schema::CURRENT_SCHEMA_VERSION;
use crate::error::AppError;
use chrono::Local;
use rusqlite::{params, Connection};

pub fn get_current_version(conn: &Connection) -> Result<i32, AppError> {
    let mut stmt = conn
        .prepare("SELECT COALESCE(MAX(version), 0) FROM schema_version")
        .map_err(|e| AppError::Database(e.to_string()))?;

    let version = stmt.query_row([], |row| row.get(0)).unwrap_or(0);

    Ok(version)
}

pub fn record_version(conn: &Connection, version: i32) -> Result<(), AppError> {
    let now = Local::now().to_rfc3339();
    conn.execute(
        "INSERT INTO schema_version (version, applied_at) VALUES (?1, ?2)",
        params![version, now],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;
    Ok(())
}

pub fn run_migrations(conn: &Connection) -> Result<(), AppError> {
    let current_version = get_current_version(conn)?;

    if current_version < 1 {
        // Version 1: 初始表结构建立
        record_version(conn, 1)?;
    }

    // 后续版本迁移示例（若版本升级到 2）:
    // if current_version < 2 && CURRENT_SCHEMA_VERSION >= 2 {
    //     conn.execute_batch("ALTER TABLE records ADD COLUMN extra TEXT NOT NULL DEFAULT '';")
    //         .map_err(|e| AppError::Database(e.to_string()))?;
    //     record_version(conn, 2)?;
    // }

    log::info!("Database schema up-to-date at version {CURRENT_SCHEMA_VERSION}");
    Ok(())
}
