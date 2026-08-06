---
name: add-sqlite-migration
description: Step-by-step guide for making SQLite database schema updates and version migrations safely.
---

# SQLite Schema Migration Recipe

When adding a new table or altering an existing table in this project:

## 1. Update Baseline Schema (`src-tauri/src/database/schema.rs`)
Add your new table's `CREATE TABLE IF NOT EXISTS` statement inside `init_schema()` so fresh installations get the full schema:

```rust
conn.execute_batch(
    r#"
    CREATE TABLE IF NOT EXISTS user_notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_pinned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );
    "#,
)?;
```

## 2. Add Incremental Migration Step (`src-tauri/src/database/migration.rs`)
For existing installations that already have version 1, add an incremental migration step:

```rust
// Example: Upgrade from version 1 to version 2
if current_version < 2 {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS user_notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_pinned INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        "#,
    )?;
    record_version(conn, 2)?;
}
```

## 3. Verify SQLite Integrity
Run `cargo check` and test that the app launches and migrates cleanly.
The current version is tracked automatically in the `schema_version` table.
