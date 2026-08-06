# SQLite & Database Rules

## 1. Concurrency and Locking
- SQLite connections are protected by `Arc<Mutex<rusqlite::Connection>>`.
- Always use the provided macro to acquire locks:
  ```rust
  let conn = lock_conn!(db_state);
  ```
- Keep lock scopes as short as possible to avoid blocking other threads.
- SQLite is configured with `PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;` for high-throughput non-blocking reads.

## 2. Migration Protocol
- Database schema changes MUST NOT be done ad-hoc without version migration.
- To add or modify tables:
  1. Add current baseline schema to `src-tauri/src/database/schema.rs`.
  2. Add incremental migration step to `src-tauri/src/database/migration.rs`:
     ```rust
     if current_version < NEW_VERSION {
         conn.execute_batch("ALTER TABLE foo ADD COLUMN bar TEXT NOT NULL DEFAULT '';")?;
         record_version(conn, NEW_VERSION)?;
     }
     ```
- Never remove columns in a way that breaks existing user data without data migration scripts.
