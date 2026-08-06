use crate::database::{lock_conn, Database};
use crate::error::AppError;
use chrono::Local;
use rusqlite::{params, OptionalExtension};
use std::collections::HashMap;

pub struct SettingsDao;

impl SettingsDao {
    pub fn get(db: &Database, key: &str) -> Result<Option<String>, AppError> {
        let conn = lock_conn!(db.conn);
        let mut stmt = conn
            .prepare("SELECT value FROM settings WHERE key = ?1")
            .map_err(|e| AppError::Database(e.to_string()))?;

        let value = stmt
            .query_row(params![key], |row| row.get(0))
            .optional()
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(value)
    }

    pub fn set(db: &Database, key: &str, value: &str) -> Result<(), AppError> {
        let conn = lock_conn!(db.conn);
        let now = Local::now().to_rfc3339();
        conn.execute(
            "INSERT INTO settings (key, value, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
            params![key, value, now],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(())
    }

    pub fn get_all(db: &Database) -> Result<HashMap<String, String>, AppError> {
        let conn = lock_conn!(db.conn);
        let mut stmt = conn
            .prepare("SELECT key, value FROM settings")
            .map_err(|e| AppError::Database(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
            .map_err(|e| AppError::Database(e.to_string()))?;

        let mut map = HashMap::new();
        for item in rows {
            let (k, v) = item.map_err(|e| AppError::Database(e.to_string()))?;
            map.insert(k, v);
        }

        Ok(map)
    }

    pub fn delete(db: &Database, key: &str) -> Result<bool, AppError> {
        let conn = lock_conn!(db.conn);
        let count = conn
            .execute("DELETE FROM settings WHERE key = ?1", params![key])
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(count > 0)
    }
}
