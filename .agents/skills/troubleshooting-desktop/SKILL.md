---
name: troubleshooting-desktop
description: Diagnostic and resolution guide for cross-platform Tauri 2 windowing, tray, SQLite locking, and panic issues.
---

# Desktop Troubleshooting Guide

## 1. Multi-Platform Window Titlebars
- **macOS Traffic Light overlap**:
  - In macOS, `titleBarStyle: "Overlay"` positions the native close/minimize/maximize buttons at top-left.
  - The UI header must have `pt-8` or `pl-20` on macOS to avoid overlapping the traffic lights.
  - Check platform with `import { isMac } from '@/lib/platform';`.
- **Windows / Linux Window Dragging**:
  - Add `data-tauri-drag-region` to any non-interactive header area to allow dragging the window.
  - Exclude buttons/inputs from the drag region to preserve clickability.

## 2. SQLite Database Lockup
- **Symptom**: IPC calls hang or return `database is locked`.
- **Fix**:
  - Always keep `lock_conn!(db)` blocks localized and avoid long async delays while holding the mutex.
  - SQLite WAL mode is configured by default; avoid manually modifying journal PRAGMAs.

## 3. Rust Panics
- **Log Location**: `~/.tauri2-react-starter/logs/panic.log`
- The panic hook in `src-tauri/src/panic_hook.rs` intercepts all panics and writes full backtraces.
- You can open the log directory directly from the Dashboard page or via the `open_logs_directory` Tauri command.

## 4. Tauri 2 Plugin Initialization Panics (`PluginInitialization`)
- **Symptom 1**: `PluginInitialization("updater", "Error deserializing 'plugins.updater' within your Tauri configuration: missing field pubkey")`
  - **Fix**: `plugins.updater` in `tauri.conf.json` requires a valid Minisign public key in `pubkey` and `endpoints`.
- **Symptom 2**: `PluginInitialization("dialog", "Error deserializing 'plugins.dialog': invalid type: map, expected unit")`
  - **Fix**: Plugins that take no custom options must be defined as empty object `{}` in `tauri.conf.json` (or omitted), never populated with unrecognized fields.
- **Symptom 3**: `PluginInitialization("...", "Plugin not allowed by capabilities")`
  - **Fix**: Declare the required permissions in `src-tauri/capabilities/default.json` (e.g. `updater:default`, `opener:default`, `dialog:default`).
- **Verification Rule**: Always run `cargo test --manifest-path src-tauri/Cargo.toml` to execute `test_tauri_conf_and_plugins_validity` before declaring a feature complete.
