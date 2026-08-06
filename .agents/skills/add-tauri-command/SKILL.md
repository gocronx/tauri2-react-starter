---
name: add-tauri-command
description: Step-by-step recipe for adding an end-to-end Tauri IPC command from Rust backend to React frontend.
---

# Add Tauri Command Recipe

Follow these 6 steps to implement a complete, type-safe full-stack command in this project:

## Step 1: DAO Layer (`src-tauri/src/database/dao/<entity>_dao.rs`)
Implement the raw database operation with Specta `Type` derive:
```rust
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct TaskItem {
    pub id: String,
    pub title: String,
    pub completed: bool,
}

pub struct TaskDao;

impl TaskDao {
    pub fn list_all(conn: &Connection) -> Result<Vec<TaskItem>> {
        let mut stmt = conn.prepare("SELECT id, title, completed FROM tasks ORDER BY id DESC")?;
        let rows = stmt.query_map([], |row| {
            Ok(TaskItem {
                id: row.get(0)?,
                title: row.get(1)?,
                completed: row.get::<_, i32>(2)? == 1,
            })
        })?;
        let mut list = Vec::new();
        for item in rows {
            list.push(item?);
        }
        Ok(list)
    }
}
```

## Step 2: Service Layer (`src-tauri/src/services/<entity>_service.rs`)
Add validation and business logic:
```rust
use crate::database::dao::task_dao::{TaskDao, TaskItem};
use crate::database::{lock_conn, Database};
use crate::error::AppError;

pub struct TaskService;

impl TaskService {
    pub fn get_tasks(db: &Database) -> Result<Vec<TaskItem>, AppError> {
        let conn = lock_conn!(db.conn);
        TaskDao::list_all(&conn).map_err(|e| AppError::Database(e.to_string()))
    }
}
```

## Step 3: Command Layer (`src-tauri/src/commands/<entity>.rs`)
Wrap in Tauri IPC command with `#[tauri::command]` and `#[specta::specta]`:
```rust
use tauri::{command, State};
use crate::services::task_service::TaskService;
use crate::database::dao::task_dao::TaskItem;
use crate::database::Database;
use crate::error::AppError;

#[command]
#[specta::specta]
pub fn get_tasks(db: State<'_, Database>) -> Result<Vec<TaskItem>, AppError> {
    TaskService::get_tasks(&db)
}
```

## Step 4: Register in Specta Builder (`src-tauri/src/lib.rs`)
Add the command to `specta_builder()` in `src-tauri/src/lib.rs`:
```rust
pub fn specta_builder() -> Builder<tauri::Wry> {
    Builder::<tauri::Wry>::new().commands(collect_commands![
        // ... existing commands
        commands::task::get_tasks,
    ])
}
```
*Note: Running `cargo test` or `pnpm dev` will automatically generate `src/lib/api/bindings.ts` with end-to-end type safety.*

## Step 5: Frontend API (`src/lib/api/<entity>.ts`)
```typescript
import { commands } from "./bindings";
import type { TaskItem } from "@/types";
import { isTauriEnv } from "./env";
import { mockTaskApi } from "./mock";

export async function fetchTasks(): Promise<TaskItem[]> {
  if (!isTauriEnv()) return mockTaskApi.list();
  const res = await commands.getTasks();
  if (res.status === "error") throw new Error(res.error);
  return res.data;
}
```

## Step 6: React Query Hook (`src/lib/query/index.ts`)
```typescript
export function useTasksQuery() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
}
```
