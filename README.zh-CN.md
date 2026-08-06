<div align="center">

# 🚀 Tauri 2 React Starter

**开箱即用、现代化企业级跨平台桌面端应用开发脚手架模板。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584?logo=rust&logoColor=black)](https://www.rust-lang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)

[English](README.md) • [简体中文](README.zh-CN.md)

</div>

---

## ✨ 核心特性

- ⚡️ **现代化技术栈**：Tauri 2.x + React 18 + Vite 5 + TypeScript + TailwindCSS
- 🔗 **Rust ↔ TypeScript 零手写类型安全 (`tauri-specta`)**：
  - 基于 `tauri-specta` 自动生成全链路 TypeScript 类型与 API 调用绑定 (`bindings.ts`)，告别手动维护 IPC 接口契约
- 🦀 **健壮 Rust 后端分层架构**：
  - `commands` (Tauri IPC 通信层 + Specta 注解)
  - `services` (业务逻辑与校验层)
  - `database/dao` (数据持久化访问层)
  - `database/migration` (SQLite 自动化版本迁移)
- 🗄️ **嵌入式 SQLite 引擎与热备份**：
  - 开启 WAL 高性能模式、外键约束与事务支持
  - 支持 **事务级在线热备份 (Online Backup API)** 与无损热恢复
- 🔄 **自动更新与独立分发生态 (`tauri-plugin-updater`)**：
  - 预置 GitHub Releases / S3 静态端点自动检查更新与一键静默安装机制
- 🌐 **Web Mock 独立开发模式**：
  - 支持 `pnpm dev:renderer` 纯前端浏览器运行（自动切换至 LocalStorage Mock 数据存储），无需编译 Rust 即可极速开发 UI
- ⌨️ **现代化快捷交互体验**：
  - 全局 **⌘K / Ctrl+K 指令面板 (Command Palette)**（基于 `cmdk`）
  - 沉浸式标题栏（支持双击最大化/还原、macOS 红绿灯自适应）
  - 窗口状态自动持久化记忆（`tauri-plugin-window-state`）
- 🛡️ **生产级崩溃防护与熔断**：
  - Rust 后端全局 Panic Hook（自动抓取 Backtrace 并持久化写入 `panic.log`）
  - 前端全链路 ErrorBoundary + 全局未捕获 Promise 监听
- 📦 **全套桌面端能力集成**：
  - 系统托盘（常驻菜单、左键切换窗口、右键托盘菜单）
  - 开机自启动管理 (`auto-launch`)
  - 单实例防多开 (`tauri-plugin-single-instance`)
  - 日志系统 (`tauri-plugin-log`)
  - 文件系统与资源管理器交互 (`tauri-plugin-opener` / `tauri-plugin-dialog`)
  - 数据批量导出 (JSON / CSV 格式一键下载)
- 🌐 **国际化与主题系统**：
  - `i18next` 简体中文/英文双语即时切换
  - `ThemeProvider` 暗黑模式/明亮模式/跟随系统无缝切换
- 📊 **状态与数据管理**：`TanStack React Query` 声明式异步缓存与请求管理
- 🪄 **一键脚手架定制与重命名**：内置 `pnpm rename` 一键全项目标识符与包名重命名
- 🧪 **质量保障与自动化**：`Vitest` + `Rust Cargo Test` 单元测试 + GitHub Actions 跨平台 CI/CD (Clippy / Rustfmt / Prettier / TypeCheck)

---

## 📁 目录结构

```text
tauri2-react-starter/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # 多平台代码质量检查与自动化测试
│       └── release.yml            # 标签触发的多平台构建发布 (macOS/Windows/Linux)
├── src-tauri/                     # 🦀 Rust 后端工程
│   ├── capabilities/              # Tauri 2 权限与能力声明
│   │   └── default.json
│   ├── icons/                     # 应用图标与托盘图标
│   ├── src/
│   │   ├── commands/              # IPC 交互命令 (app / settings / record)
│   │   ├── services/              # 业务逻辑与校验
│   │   ├── database/              # SQLite 数据库核心
│   │   │   ├── dao/               # 数据访问对象 (CRUD)
│   │   │   ├── schema.rs          # 数据表初始化
│   │   │   └── migration.rs       # 增量迁移执行器
│   │   ├── auto_launch.rs         # 开机自启动管理
│   │   ├── error.rs               # 强类型统一错误定义
│   │   ├── panic_hook.rs          # 崩溃捕获与持久化日志
│   │   ├── tray.rs                # 系统托盘菜单与事件处理
│   │   ├── lib.rs                 # Tauri 插件与 Handler 注册中心
│   │   └── main.rs                # 应用程序入口
│   ├── Cargo.toml                 # Rust 依赖配置
│   ├── tauri.conf.json            # Tauri 2 应用配置
│   └── build.rs                   # 构建脚本
├── src/                           # ⚛️ React 前端工程
│   ├── components/                # UI 组件库
│   │   ├── layout/                # 布局组件 (TitleBar, Sidebar, AppLayout)
│   │   ├── ui/                    # 原子组件 (Button, Dialog, Input, Switch, Card, etc.)
│   │   ├── FrontendErrorBoundary.tsx # 前端异常熔断捕获
│   │   └── theme-provider.tsx     # 主题状态上下文
│   ├── i18n/                      # 国际化配置与双语语言包
│   ├── lib/
│   │   ├── api/                   # Tauri invoke 类型安全封装
│   │   ├── query/                 # React Query Hooks & 缓存 Key
│   │   ├── frontendLogger.ts      # 前端全局异常监控
│   │   ├── platform.ts            # 平台检测与窗口拖拽辅助
│   │   └── utils.ts               # 通用工具函数
│   ├── pages/                     # 视图页面 (Dashboard, Records, Settings)
│   ├── types/                     # 全局 TypeScript 接口定义
│   ├── App.tsx                    # 根组件
│   ├── index.css                  # Tailwind CSS 与设计系统变量
│   └── main.tsx                   # 前端启动引导入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## ⚡️ 快速上手

### 1. 环境准备
确保您的开发机器已安装：
- **Node.js**: `>= 18.0.0`（推荐使用 `pnpm`）
- **Rust**: `>= 1.80.0`（通过 `rustup` 安装）
- **C++ 编译工具链** (macOS Xcode CLT / Windows MSVC / Linux webkit2gtk)

### 2. 安装依赖与一键重命名
```bash
# 1. 安装依赖
pnpm install

# 2. (可选) 一键定制您的项目名称、Bundle Identifier 与展示标题
pnpm rename my-desktop-app com.mycompany.myapp "My Desktop App"
```

### 3. 启动开发服务器
```bash
# 启动 Tauri 桌面端热更新开发模式 (全功能联动)
pnpm dev

# 启动纯前端 Web 开发模式 (无 Rust 环境快速开发 UI，自动启用 LocalStorage Mock)
pnpm dev:renderer
```

### 4. 代码检查与测试质量门禁
```bash
# 执行前端格式化与规范检查
pnpm format
pnpm format:check

# 执行 TypeScript 静态类型检查
pnpm typecheck

# 执行前端单元测试 (Vitest)
pnpm test

# 执行 Rust 后端代码风格检查、Clippy 静态分析与单元测试
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

### 5. 构建生产安装包
```bash
# 构建生成对应系统的 DMG / MSI / AppImage / DEB 安装包
pnpm build
```
