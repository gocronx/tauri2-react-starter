import { commands } from "./bindings";
import type { AppInfo, SystemStats } from "@/types";
import { isTauriEnv } from "./env";
import { mockAppApi } from "./mock";

function unwrap<T>(
  res: { status: "ok"; data: T } | { status: "error"; error: string },
): T {
  if (res.status === "error") throw new Error(res.error);
  return res.data;
}

export const appApi = {
  async getInfo(): Promise<AppInfo> {
    if (!isTauriEnv()) return mockAppApi.getInfo();
    return unwrap(await commands.getAppInfo());
  },

  async getStats(): Promise<SystemStats> {
    if (!isTauriEnv()) return mockAppApi.getStats();
    return unwrap(await commands.getSystemStats());
  },

  async openLogsDir(): Promise<void> {
    if (!isTauriEnv()) return mockAppApi.openLogsDir();
    unwrap(await commands.openLogsDirectory());
  },

  async openDataDir(): Promise<void> {
    if (!isTauriEnv()) return mockAppApi.openDataDir();
    unwrap(await commands.openDataDirectory());
  },

  async backupDatabase(targetPath: string): Promise<string> {
    if (!isTauriEnv()) return mockAppApi.backupDatabase(targetPath);
    return unwrap(await commands.backupDatabase(targetPath));
  },

  async restoreDatabase(sourcePath: string): Promise<string> {
    if (!isTauriEnv()) return mockAppApi.restoreDatabase(sourcePath);
    return unwrap(await commands.restoreDatabase(sourcePath));
  },
};
