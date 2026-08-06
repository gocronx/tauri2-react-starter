use crate::database::{lock_conn, Database};
use crate::error::AppError;
use chrono::Local;
use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct RecordItem {
    pub id: String,
    pub title: String,
    pub content: String,
    pub status: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct CreateRecordDto {
    pub title: String,
    #[specta(optional)]
    pub content: Option<String>,
    #[specta(optional)]
    pub status: Option<String>,
    #[specta(optional)]
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct UpdateRecordDto {
    pub id: String,
    #[specta(optional)]
    pub title: Option<String>,
    #[specta(optional)]
    pub content: Option<String>,
    #[specta(optional)]
    pub status: Option<String>,
    #[specta(optional)]
    pub tags: Option<Vec<String>>,
}

pub struct RecordDao;

impl RecordDao {
    pub fn list(db: &Database, query: Option<&str>) -> Result<Vec<RecordItem>, AppError> {
        let conn = lock_conn!(db.conn);
        let sql = match query {
            Some(q) if !q.trim().is_empty() => {
                "SELECT id, title, content, status, tags, created_at, updated_at
                 FROM records
                 WHERE title LIKE ?1 OR content LIKE ?1
                 ORDER BY created_at DESC"
            }
            _ => {
                "SELECT id, title, content, status, tags, created_at, updated_at
                 FROM records
                 ORDER BY created_at DESC"
            }
        };

        let mut stmt = conn
            .prepare(sql)
            .map_err(|e| AppError::Database(e.to_string()))?;

        let rows = if let Some(q) = query {
            let pattern = format!("%{}%", q.trim());
            stmt.query_map(params![pattern], Self::map_row)
        } else {
            stmt.query_map([], Self::map_row)
        }
        .map_err(|e| AppError::Database(e.to_string()))?;

        let mut records = Vec::new();
        for r in rows {
            records.push(r.map_err(|e| AppError::Database(e.to_string()))?);
        }

        Ok(records)
    }

    pub fn get(db: &Database, id: &str) -> Result<Option<RecordItem>, AppError> {
        let conn = lock_conn!(db.conn);
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, status, tags, created_at, updated_at
                 FROM records WHERE id = ?1",
            )
            .map_err(|e| AppError::Database(e.to_string()))?;

        let item = stmt
            .query_row(params![id], Self::map_row)
            .optional()
            .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(item)
    }

    pub fn create(db: &Database, dto: CreateRecordDto) -> Result<RecordItem, AppError> {
        let conn = lock_conn!(db.conn);
        let id = Uuid::new_v4().to_string();
        let now = Local::now().to_rfc3339();
        let content = dto.content.unwrap_or_default();
        let status = dto.status.unwrap_or_else(|| "active".to_string());
        let tags = dto.tags.unwrap_or_default();
        let tags_json = serde_json::to_string(&tags).unwrap_or_else(|_| "[]".to_string());

        conn.execute(
            "INSERT INTO records (id, title, content, status, tags, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![id, dto.title, content, status, tags_json, now, now],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(RecordItem {
            id,
            title: dto.title,
            content,
            status,
            tags,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub fn update(db: &Database, dto: UpdateRecordDto) -> Result<RecordItem, AppError> {
        let existing = Self::get(db, &dto.id)?
            .ok_or_else(|| AppError::NotFound(format!("Record with id {} not found", dto.id)))?;

        let conn = lock_conn!(db.conn);
        let now = Local::now().to_rfc3339();
        let title = dto.title.unwrap_or(existing.title);
        let content = dto.content.unwrap_or(existing.content);
        let status = dto.status.unwrap_or(existing.status);
        let tags = dto.tags.unwrap_or(existing.tags);
        let tags_json = serde_json::to_string(&tags).unwrap_or_else(|_| "[]".to_string());

        conn.execute(
            "UPDATE records SET title = ?1, content = ?2, status = ?3, tags = ?4, updated_at = ?5
             WHERE id = ?6",
            params![title, content, status, tags_json, now, dto.id],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(RecordItem {
            id: dto.id,
            title,
            content,
            status,
            tags,
            created_at: existing.created_at,
            updated_at: now,
        })
    }

    pub fn delete(db: &Database, id: &str) -> Result<bool, AppError> {
        let conn = lock_conn!(db.conn);
        let count = conn
            .execute("DELETE FROM records WHERE id = ?1", params![id])
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(count > 0)
    }

    fn map_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<RecordItem> {
        let tags_json: String = row.get(4)?;
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        Ok(RecordItem {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            status: row.get(3)?,
            tags,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    }
}
