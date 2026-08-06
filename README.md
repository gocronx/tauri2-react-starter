<div align="center">

# 🚀 Tauri 2 React Starter

**A production-ready, batteries-included starter template for building modern cross-platform desktop applications.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584?logo=rust&logoColor=black)](https://www.rust-lang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)

[English](README.md) • [简体中文](README.zh-CN.md)

</div>

---

## ✨ Key Features

- ⚡️ **Modern Tech Stack**: Tauri 2.x + React 18 + Vite 5 + TypeScript + Tailwind CSS
- 🔗 **End-to-End Type Safety with `tauri-specta`**:
  - Automatically exports Rust commands and DTOs to TypeScript (`bindings.ts`) for zero-manual IPC maintenance
- 🦀 **Clean 4-Layer Rust Backend**:
  - `commands`: Tauri IPC handlers with `specta` annotations
  - `services`: Business logic and parameter validation
  - `database/dao`: Data Access Objects with parameterized queries
  - `database/migration`: Incremental SQLite schema version migrations
- 🗄️ **Embedded SQLite Engine & Online Hot Backup**:
  - Configured with WAL mode, foreign key constraints, and transactional consistency
  - Real-time online backup via SQLite Backup API (`backup_database` & `restore_database`)
- 🔄 **Auto-Update & Distribution (`tauri-plugin-updater`)**:
  - Built-in GitHub Releases / S3 endpoint update checks and silent background updates
- 🌐 **Web Mock Standalone Mode**:
  - Run `pnpm dev:renderer` in pure browser mode with automatic `LocalStorage` mock fallback—develop UI without Rust compilation
- ⌨️ **Command Palette & Polished UX**:
  - Global **⌘K / Ctrl+K Command Palette** powered by `cmdk`
  - Frameless immersive titlebar with macOS native traffic-light awareness and Windows/Linux custom controls
  - Window geometry persistence via `tauri-plugin-window-state`
- 🛡️ **Enterprise-Grade Crash Protection**:
  - Rust panic hook with automatic backtrace capture saved to `panic.log`
  - Frontend `FrontendErrorBoundary` with uncaught promise rejection interception
- 📦 **Desktop System Integration**:
  - System Tray (context menu, left-click show/hide toggle)
  - Auto-launch at login management (`auto-launch`)
  - Single-instance lock (`tauri-plugin-single-instance`)
  - Rolling log file management (`tauri-plugin-log`)
  - File system & OS native dialogs (`tauri-plugin-opener` / `tauri-plugin-dialog`)
  - Data batch export (one-click CSV / JSON download)
- 🌐 **i18n & Theming**:
  - Instant Chinese / English language switching (`i18next`)
  - Dark, Light, and System theme synchronization (`ThemeProvider`)
- 📊 **State & Async Cache**: TanStack React Query for declarative data fetching and cache invalidation
- 🪄 **One-Command Project Customization**: Built-in `pnpm rename` to customize package name, bundle ID, and window titles in seconds
- 🧪 **Quality Assurance & CI/CD**: `Vitest` + `Cargo Test` unit tests + GitHub Actions workflows for multi-platform checks and releases

---

## 📁 Project Structure

```text
tauri2-react-starter/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Multi-platform code linting, typecheck & tests
│       └── release.yml            # Tag-triggered multi-platform release builds
├── src-tauri/                     # 🦀 Rust Backend
│   ├── capabilities/              # Tauri 2 permission capabilities
│   │   └── default.json
│   ├── icons/                     # App and tray icons
│   ├── src/
│   │   ├── commands/              # IPC command handlers (app, settings, record)
│   │   ├── services/              # Business validation and domain services
│   │   ├── database/              # SQLite database core
│   │   │   ├── dao/               # Data Access Objects (CRUD)
│   │   │   ├── schema.rs          # DDL tables initialization
│   │   │   └── migration.rs       # Version migration runner
│   │   ├── auto_launch.rs         # Auto-start management
│   │   ├── error.rs               # Strongly-typed unified AppError
│   │   ├── panic_hook.rs          # Crash backtrace interceptor
│   │   ├── tray.rs                # System tray initialization & events
│   │   ├── lib.rs                 # Tauri plugins, Specta builder & handler registry
│   │   └── main.rs                # Application entrypoint
│   ├── Cargo.toml                 # Rust dependencies
│   ├── tauri.conf.json            # Tauri 2 configuration
│   └── build.rs                   # Build script
├── src/                           # ⚛️ React Frontend
│   ├── components/                # Reusable UI component library
│   │   ├── layout/                # TitleBar, Sidebar, AppLayout
│   │   ├── ui/                    # Radix UI primitives (Button, Dialog, Input, Switch, etc.)
│   │   ├── FrontendErrorBoundary.tsx # Error boundary with crash recovery UI
│   │   └── theme-provider.tsx     # Theme provider context
│   ├── i18n/                      # Internationalization locales (zh / en)
│   ├── lib/
│   │   ├── api/                   # Type-safe Specta IPC bindings & mock fallbacks
│   │   ├── query/                 # React Query hooks & query keys
│   │   ├── frontendLogger.ts      # Global frontend error telemetry
│   │   ├── platform.ts            # OS detection & window drag helpers
│   │   └── utils.ts               # Utility helpers
│   ├── pages/                     # Application views (Dashboard, Records, Settings)
│   ├── types/                     # Shared TypeScript types
│   ├── App.tsx                    # Root application component
│   ├── index.css                  # Tailwind CSS design system tokens
│   └── main.tsx                   # Frontend bootstrap entrypoint
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## ⚡️ Quick Start

### 1. Prerequisites
Ensure your development machine has:
- **Node.js**: `>= 18.0.0` (`pnpm` recommended)
- **Rust**: `>= 1.80.0` (installed via `rustup`)
- **C++ Build Tools** (macOS Xcode CLT / Windows MSVC / Linux webkit2gtk)

### 2. Install & Rename
```bash
# 1. Install dependencies
pnpm install

# 2. (Optional) Customize your project name, bundle identifier, and window title
pnpm rename my-desktop-app com.mycompany.myapp "My Desktop App"
```

### 3. Start Development Server
```bash
# Start full desktop app with hot-reloading (Tauri + Rust + Vite)
pnpm dev

# Start frontend-only web development (Instant UI prototyping with LocalStorage mock)
pnpm dev:renderer
```

### 4. Code Quality & Test Gates
```bash
# Frontend linting & formatting
pnpm format
pnpm format:check

# TypeScript typecheck
pnpm typecheck

# Frontend unit tests (Vitest)
pnpm test

# Rust backend formatting, Clippy linting, and unit tests
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

### 5. Build Desktop Installers
```bash
# Builds DMG / MSI / AppImage / DEB packages for the target platform
pnpm build
```
