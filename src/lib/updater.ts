import { isTauriEnv } from "@/lib/api/env";

export interface UpdateCheckResult {
  hasUpdate: boolean;
  version?: string;
  currentVersion?: string;
  body?: string;
  date?: string;
  downloadAndInstall?: () => Promise<void>;
}

export async function checkAppUpdate(): Promise<UpdateCheckResult> {
  if (!isTauriEnv()) {
    return {
      hasUpdate: false,
    };
  }

  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();

    if (update && update.available) {
      return {
        hasUpdate: true,
        version: update.version,
        currentVersion: update.currentVersion,
        body: update.body,
        date: update.date,
        downloadAndInstall: async () => {
          const { relaunch } = await import("@tauri-apps/plugin-process");
          await update.downloadAndInstall();
          await relaunch();
        },
      };
    }
  } catch (error) {
    console.warn("Failed to check for updates:", error);
  }

  return {
    hasUpdate: false,
  };
}
