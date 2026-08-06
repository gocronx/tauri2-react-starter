# Architecture Rules

## 1. Rust Backend Hierarchy
The Rust backend is structured into four distinct layers:

1. **Commands Layer (`src-tauri/src/commands/`)**:
   - Entry point for Tauri IPC invocations from frontend.
   - Responsible for extracting arguments, accessing `tauri::State`, and returning `Result<T, AppError>`.
   - Must delegate actual business logic to the `services` layer.

2. **Services Layer (`src-tauri/src/services/`)**:
   - Contains domain business logic, data validation, and aggregation.
   - Independent of Tauri IPC details; easily testable with Rust unit tests.
   - Coordinates one or multiple DAOs.

3. **DAO Layer (`src-tauri/src/database/dao/`)**:
   - Exclusively responsible for executing SQL statements via `rusqlite`.
   - Handles SQL parameter binding and Row-to-Struct deserialization.
   - Uses `lock_conn!(db_state)` to get synchronized database access.

4. **Database & Migration Layer (`src-tauri/src/database/`)**:
   - Initializes SQLite connection with WAL mode and foreign key enforcement.
   - Manages incremental database schema migrations via `schema_version` table.

## 2. Frontend Hierarchy
The React 18 frontend is structured into:

1. **API Layer (`src/lib/api/`)**:
   - Type-safe wrappers around `@tauri-apps/api/core` `invoke()`.
2. **Query Layer (`src/lib/query/`)**:
   - TanStack React Query custom hooks for declarative caching, polling, and cache invalidation.
3. **UI Components (`src/components/ui/`)**:
   - Atomic Radix UI primitives styled with TailwindCSS and `class-variance-authority`.
4. **Layout Components (`src/components/layout/`)**:
   - Cross-platform responsive `TitleBar`, `Sidebar`, and master `AppLayout`.
5. **Views (`src/pages/`)**:
   - Modular feature pages (Dashboard, Records, Settings).
