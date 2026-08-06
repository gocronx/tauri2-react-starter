# CLAUDE.md

This project is a high-performance **Tauri 2 + React 18 + Rust + SQLite** cross-platform desktop application starter.

## 🚀 Quick Commands
- `pnpm dev`: Start full desktop dev environment with hot reloading
- `pnpm dev:renderer`: Start frontend in browser only
- `pnpm typecheck`: Run TypeScript type checker (`tsc --noEmit`)
- `pnpm test`: Run frontend unit tests (`vitest run`)
- `pnpm format`: Format all code with Prettier
- `pnpm lint`: Check formatting with Prettier
- `cargo check --manifest-path src-tauri/Cargo.toml`: Check Rust backend
- `cargo test --manifest-path src-tauri/Cargo.toml`: Run Rust unit tests
- `pnpm build`: Build production desktop installer

## 🏗️ Architecture Rules
1. **Backend Layering**: `commands/` -> `services/` -> `database/dao/` -> SQLite WAL.
2. **Error Handling**: Use `AppError` (`thiserror`) in Rust; use `sonner` toasts and `FrontendErrorBoundary` in React.
3. **Database**: Always access SQLite via `lock_conn!(db_state)` and keep queries in `dao/`.
4. **Design System**: Use semantic Tailwind classes (no hardcoded hex colors).
5. **Multi-platform**: Check `isMac` / `isWindows` for platform-specific window handling.
6. **Detailed guidelines & skills**: Refer to `AGENTS.md` and `.agents/skills/`.
