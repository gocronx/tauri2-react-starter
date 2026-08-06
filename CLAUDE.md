# CLAUDE.md

This project is a high-performance **Tauri 2 + React 18 + Rust + SQLite** cross-platform desktop application starter.

## 🚀 Quick Commands
- `pnpm verify`: Run ALL checks (Prettier + TypeScript + Vitest + Rust fmt + Clippy + Rust tests)
- `pnpm dev`: Start full desktop dev environment with hot reloading
- `pnpm dev:renderer`: Start frontend in browser only
- `pnpm typecheck`: Run TypeScript type checker (`tsc --noEmit`)
- `pnpm test`: Run frontend unit tests (`vitest run`)
- `pnpm format`: Format all code with Prettier
- `pnpm lint`: Check formatting with Prettier
- `cargo check --manifest-path src-tauri/Cargo.toml`: Check Rust backend
- `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`: Strict Rust linter
- `cargo test --manifest-path src-tauri/Cargo.toml`: Run Rust unit tests
- `pnpm build`: Build production desktop installer

## 🏗️ Architecture & Verification Rules
1. **Pre-commit Self Verification**: Always execute `pnpm verify` locally before concluding any task or pushing commits.
2. **Remote CI Tracking**: When solving CI/CD or platform build issues, poll `gh run view` until all CI matrix jobs pass.
3. **Windows Manifest Protection**: Never remove `src-tauri/windows-app-manifest.xml` or MSVC linker injection in `build.rs`.
4. **Backend Layering**: `commands/` -> `services/` -> `database/dao/` -> SQLite WAL.
5. **Error Handling**: Use `AppError` (`thiserror`) in Rust; use `sonner` toasts and `FrontendErrorBoundary` in React.
6. **Database**: Always access SQLite via `lock_conn!(db_state)` and keep queries in `dao/`.
7. **Design System**: Use semantic Tailwind classes (no hardcoded hex colors).
8. **Multi-platform**: Check `isMac` / `isWindows` for platform-specific window handling.
9. **Detailed guidelines & skills**: Refer to `AGENTS.md` and `.agents/skills/`.
