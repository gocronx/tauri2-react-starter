#!/usr/bin/env node

/**
 * Tauri 2 Starter 一键脚手架重命名工具
 * Usage:
 *   node scripts/rename.js <app-name> [identifier] [display-title]
 * Example:
 *   node scripts/rename.js my-desktop-app com.company.myapp "My Desktop App"
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function replaceInFile(filePath, search, replacement) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const updated = content.replaceAll(search, replacement);
  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`  ✓ 已更新: ${path.relative(rootDir, filePath)}`);
}

async function main() {
  console.log("\n=======================================================");
  console.log("       Tauri 2 + React 脚手架一键重命名工具");
  console.log("=======================================================\n");

  let appName = process.argv[2];
  let identifier = process.argv[3];
  let displayTitle = process.argv[4];

  if (!appName) {
    appName = await prompt("请输入项目英文名 (如 my-desktop-app): ");
  }
  if (!appName) {
    console.error("❌ 项目名称不能为空！");
    process.exit(1);
  }

  // 格式化 appName 为 kebab-case
  appName = appName.toLowerCase().replace(/[^a-z0-9-_]/g, "-");

  if (!identifier) {
    const defaultId = `com.starter.${appName.replace(/-/g, "")}`;
    identifier = await prompt(`请输入 App 唯一标识符 [默认: ${defaultId}]: `);
    if (!identifier) identifier = defaultId;
  }

  if (!displayTitle) {
    const defaultTitle = appName
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    displayTitle = await prompt(`请输入应用展示标题 [默认: ${defaultTitle}]: `);
    if (!displayTitle) displayTitle = defaultTitle;
  }

  console.log("\n🚀 开始执行全局重命名配置:");
  console.log(`   - 英文包名 (kebab-case): ${appName}`);
  console.log(`   - Bundle Identifier:     ${identifier}`);
  console.log(`   - 展示标题 (Title):      ${displayTitle}\n`);

  // 1. package.json
  const pkgPath = path.join(rootDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = appName;
    pkg.description = `${displayTitle} built with Tauri 2 and React`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log(`  ✓ 已更新: package.json`);
  }

  // 2. src-tauri/Cargo.toml
  const cargoPath = path.join(rootDir, "src-tauri", "Cargo.toml");
  if (fs.existsSync(cargoPath)) {
    let cargo = fs.readFileSync(cargoPath, "utf8");
    cargo = cargo.replace(
      /name = "tauri2-react-starter"/,
      `name = "${appName.replace(/-/g, "_")}"`,
    );
    cargo = cargo.replace(
      /description = ".*"/,
      `description = "${displayTitle} desktop application"`,
    );
    fs.writeFileSync(cargoPath, cargo, "utf8");
    console.log(`  ✓ 已更新: src-tauri/Cargo.toml`);
  }

  // 3. src-tauri/tauri.conf.json
  const tauriConfPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
  if (fs.existsSync(tauriConfPath)) {
    const conf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
    conf.productName = appName;
    conf.identifier = identifier;
    if (conf.app?.windows?.[0]) {
      conf.app.windows[0].title = displayTitle;
    }
    fs.writeFileSync(tauriConfPath, JSON.stringify(conf, null, 2) + "\n", "utf8");
    console.log(`  ✓ 已更新: src-tauri/tauri.conf.json`);
  }

  // 4. index.html
  const indexPath = path.join(rootDir, "index.html");
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, "utf8");
    indexHtml = indexHtml.replace(/<title>.*<\/title>/, `<title>${displayTitle}</title>`);
    fs.writeFileSync(indexPath, indexHtml, "utf8");
    console.log(`  ✓ 已更新: index.html`);
  }

  // 5. src/components/layout/TitleBar.tsx & Sidebar.tsx
  replaceInFile(
    path.join(rootDir, "src", "components", "layout", "TitleBar.tsx"),
    "Tauri 2 Starter",
    displayTitle,
  );
  replaceInFile(
    path.join(rootDir, "src", "components", "layout", "Sidebar.tsx"),
    "Tauri 2 Starter",
    displayTitle,
  );

  // 6. src-tauri/src/commands/app.rs
  replaceInFile(
    path.join(rootDir, "src-tauri", "src", "commands", "app.rs"),
    '"tauri2-react-starter"',
    `"${appName}"`,
  );

  console.log("\n🎉 重命名完成！您的专属应用已配置就绪。");
  console.log("👉 运行 `pnpm dev` 启动桌面端调试，或 `pnpm dev:renderer` 启动纯前端预览！\n");
}

main().catch((err) => {
  console.error("❌ 重命名过程中发生错误:", err);
  process.exit(1);
});
