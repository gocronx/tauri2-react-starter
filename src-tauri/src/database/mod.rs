pub mod dao;
pub mod migration;
pub mod schema;

use crate::error::AppError;
use crate::panic_hook::get_app_dir;
use rusqlite::Connection;
use std::fs::create_dir_all;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

#[macro_export]
macro_rules! lock_conn {
    ($conn:expr) => {
        $conn
            .lock()
            .map_err(|e| $crate::error::AppError::Lock(e.to_string()))?
    };
}

pub(crate) use lock_conn;

#[derive(Clone)]
pub struct Database {
    pub conn: Arc<Mutex<Connection>>,
    pub db_path: PathBuf,
}

impl Database {
    pub fn new(path: impl AsRef<Path>) -> Result<Self, AppError> {
        let db_path = path.as_ref().to_path_buf();
        if let Some(parent) = db_path.parent() {
            create_dir_all(parent).map_err(|e| AppError::io(parent, e))?;
        }

        let conn = Connection::open(&db_path).map_err(|e| AppError::Database(e.to_string()))?;

        // 配置 SQLite PRAGMA 高性能参数
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;
             PRAGMA busy_timeout = 5000;",
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
            db_path,
        };

        // 执行表结构初始化和迁移
        db.init()?;

        Ok(db)
    }

    pub fn default_path() -> PathBuf {
        get_app_dir().join("data.db")
    }

    pub fn init_default() -> Result<Self, AppError> {
        Self::new(Self::default_path())
    }

    fn init(&self) -> Result<(), AppError> {
        let conn = lock_conn!(self.conn);
        schema::create_tables(&conn)?;
        migration::run_migrations(&conn)?;
        Ok(())
    }

    /// 热备份当前数据库到目标路径
    pub fn backup_to(&self, target_path: impl AsRef<Path>) -> Result<(), AppError> {
        let target_path = target_path.as_ref();
        if let Some(parent) = target_path.parent() {
            create_dir_all(parent).map_err(|e| AppError::io(parent, e))?;
        }
        let src_conn = lock_conn!(self.conn);
        let mut dst_conn =
            Connection::open(target_path).map_err(|e| AppError::Database(e.to_string()))?;
        let backup = rusqlite::backup::Backup::new(&src_conn, &mut dst_conn)
            .map_err(|e| AppError::Database(e.to_string()))?;
        backup
            .run_to_completion(5, std::time::Duration::from_millis(250), None)
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(())
    }

    /// 从备份文件热恢复数据到当前数据库
    pub fn restore_from(&self, source_path: impl AsRef<Path>) -> Result<(), AppError> {
        let source_path = source_path.as_ref();
        if !source_path.exists() {
            return Err(AppError::InvalidInput(format!(
                "备份文件不存在: {}",
                source_path.display()
            )));
        }
        let src_conn =
            Connection::open(source_path).map_err(|e| AppError::Database(e.to_string()))?;
        let mut dst_conn = lock_conn!(self.conn);
        let backup = rusqlite::backup::Backup::new(&src_conn, &mut dst_conn)
            .map_err(|e| AppError::Database(e.to_string()))?;
        backup
            .run_to_completion(5, std::time::Duration::from_millis(250), None)
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_database_backup_and_restore() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("main.db");
        let backup_path = dir.path().join("backup.db");

        let db = Database::new(&db_path).unwrap();
        {
            let conn = db.conn.lock().unwrap();
            conn.execute(
                "INSERT INTO settings (key, value, updated_at) VALUES ('app_mode', 'production', datetime('now'))",
                [],
            )
            .unwrap();
        }

        // Test Backup
        db.backup_to(&backup_path).unwrap();
        assert!(backup_path.exists());

        // Modify original database
        {
            let conn = db.conn.lock().unwrap();
            conn.execute(
                "UPDATE settings SET value = 'modified', updated_at = datetime('now') WHERE key = 'app_mode'",
                [],
            )
            .unwrap();
        }

        // Test Restore
        db.restore_from(&backup_path).unwrap();

        // Verify restored value
        {
            let conn = db.conn.lock().unwrap();
            let val: String = conn
                .query_row(
                    "SELECT value FROM settings WHERE key = 'app_mode'",
                    [],
                    |r| r.get(0),
                )
                .unwrap();
            assert_eq!(val, "production");
        }
    }
}
