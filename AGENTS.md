# 🤖 AGENTS.md — AI Vibe Coding Guidelines for tauri2-react-starter

This document is the **architectural contract and operating manual** for AI coding assistants (Antigravity, Claude Code, Cursor, Windsurf, Copilot, etc.) working on this codebase.

---

## 🏛️ 1. Architecture Mental Model

The application follows a **strict 4-layer backend + reactive frontend** architecture.

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
│   (Pages → Components → React Query Hooks → API Layer) │
└───────────────────────────┬────────────────────────────┘
                            │ Tauri IPC (`invoke`)
┌───────────────────────────▼────────────────────────────┐
│              Layer 1: Commands (`src-tauri/src/commands/`)  │
│              - Input parsing, parameter validation     │
├────────────────────────────────────────────────────────┤
│              Layer 2: Services (`src-tauri/src/services/`)  │
│              - Core business logic, orchestration      │
├────────────────────────────────────────────────────────┤
│              Layer 3: DAO (`src-tauri/src/database/dao/`)   │
│              - SQL queries, rusqlite row mapping       │
├────────────────────────────────────────────────────────┤
│              Layer 4: SQLite Database Engine           │
│              - WAL mode, Foreign keys, Migrations      │
└────────────────────────────────────────────────────────┘
```

---

## ⛔ 2. Golden Rules (DO NOT BREAK)

1. **NEVER write raw SQL in Commands or Services**:
   - All SQL queries belong exclusively in `src-tauri/src/database/dao/`.
   - Use the `lock_conn!(db_state)` macro to safely acquire database mutex locks.
2. **NEVER use `unwrap()` or `expect()` in Rust production code**:
   - Always return `Result<T, AppError>`.
   - Propagate errors using `?` or map them to `AppError`.
3. **NEVER hardcode colors in Frontend components**:
   - Always use semantic Tailwind tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-primary`, etc.).
4. **NEVER ignore platform differences**:
   - macOS uses overlay traffic lights (leave `pt-8` drag space).
   - Windows/Linux uses custom frameless titlebar with minimize/maximize/close buttons.
5. **Always maintain i18n parity**:
   - When adding user-facing text, add keys to both `src/i18n/locales/zh.json` and `src/i18n/locales/en.json`.
6. **Tauri 2 Plugin Config Safety (Runtime Schema 防呆)**:
   - `tauri.conf.json` 中的插件参数在**应用启动运行时**动态反序列化，仅靠 `cargo check` 无法发现配置缺失（如 `updater` 必填 `pubkey`、`dialog` 必须为 `{}`）。
   - 凡是增删改插件，必须在 `src-tauri/src/lib.rs` 的单元测试 `test_tauri_conf_and_plugins_validity` 中声明校验，并在真实运行/测试中验证通过。
7. **全量自验证纪律 (Full Verification Before Commit)**:
   - 每次代码修改或交付前，AI **必须**在本地执行 `pnpm verify` 并确保 100% 通过（涵盖前端代码格式、TypeScript 类型检查、Vitest 单元测试，以及 Rust 代码格式、Clippy 零警告检查和全部 Rust 单元测试）。
8. **CI/CD 修复闭环追踪铁律 (Remote CI Tracking Discipline)**:
   - 凡涉及 CI/CD、构建流水线或跨平台环境的修复，AI **严禁**在仅推送代码后就声称“已解决”；**必须**使用 GitHub CLI (`gh run view <run_id>`) 实时轮询追踪远程流水线，直至全部矩阵任务（macOS / Ubuntu / Windows）全部绿灯。
9. **Windows 平台清单与无头测试规范 (Windows Manifest Protection)**:
   - Windows 上的 Tauri 依赖需要 Common-Controls v6 (`comctl32.dll` 6.0) 清单。必须保留 `src-tauri/windows-app-manifest.xml` 并通过 `src-tauri/build.rs` 中的 MSVC 链接器原生参数 `/MANIFEST:EMBED` 注入，同时保持 `src-tauri/Cargo.toml` 中 `[[bin]] test = false`，防止 `0xc0000139` 入口点缺失和 `CVT1100` 重复资源冲突。

---

## 🛠️ 3. Common Development Commands

| Task | Command |
| :--- | :--- |
| **Full Pre-commit Verification (All Checks)** | `pnpm verify` |
| **Start Desktop App (Hot Reload)** | `pnpm dev` |
| **Start Web-Only Dev (Fast UI)** | `pnpm dev:renderer` |
| **TypeScript Typecheck** | `pnpm typecheck` |
| **Frontend Unit Tests** | `pnpm test` |
| **Code Formatting** | `pnpm format` |
| **Format Check** | `pnpm lint` |
| **Rust Backend Check** | `cargo check --manifest-path src-tauri/Cargo.toml` |
| **Rust Clippy (Strict)** | `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` |
| **Rust Tests** | `cargo test --manifest-path src-tauri/Cargo.toml` |
| **Build Desktop Installer** | `pnpm build` |

---

## 🧩 4. Feature Implementation Workflow

When adding a full-stack feature, follow this order:

1. **Database / DAO**:
   - Add schema/table in `src-tauri/src/database/schema.rs` or `migration.rs`.
   - Create DAO in `src-tauri/src/database/dao/<feature>_dao.rs`.
2. **Service**:
   - Create service in `src-tauri/src/services/<feature>_service.rs` with business validation.
3. **Command**:
   - Create command in `src-tauri/src/commands/<feature>.rs`.
   - Register in `src-tauri/src/lib.rs` under `tauri::generate_handler![...]`.
4. **Frontend API**:
   - Define TypeScript interfaces in `src/types/index.ts`.
   - Add IPC caller in `src/lib/api/<feature>.ts`.
5. **React Query**:
   - Add query hooks & mutations in `src/lib/query/index.ts`.
6. **UI Component / Page**:
   - Create Radix UI + Tailwind view in `src/pages/` or `src/components/`.
   - Wrap with `FrontendErrorBoundary` and use `toast` for notifications.

---

## 📚 5. Available Skills (`.agents/skills/`)

For specialized tasks, consult the step-by-step guides in:
- [add-tauri-command](file:///.agents/skills/add-tauri-command/SKILL.md) — How to add an end-to-end Tauri IPC command.
- [add-sqlite-migration](file:///.agents/skills/add-sqlite-migration/SKILL.md) — How to write SQLite schema migrations.
- [add-ui-component](file:///.agents/skills/add-ui-component/SKILL.md) — How to build Radix + Tailwind components.
- [troubleshooting-desktop](file:///.agents/skills/troubleshooting-desktop/SKILL.md) — Multi-platform window, tray & panic debugging.
