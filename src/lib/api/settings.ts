import { commands } from "./bindings";
import { isTauriEnv } from "./env";
import { mockSettingsApi } from "./mock";

function unwrap<T>(
  res: { status: "ok"; data: T } | { status: "error"; error: string },
): T {
  if (res.status === "error") throw new Error(res.error);
  return res.data;
}

export const settingsApi = {
  async get(key: string): Promise<string | null> {
    if (!isTauriEnv()) return mockSettingsApi.get(key);
    return unwrap(await commands.getSetting(key));
  },

  async set(key: string, value: string): Promise<void> {
    if (!isTauriEnv()) return mockSettingsApi.set(key, value);
    unwrap(await commands.setSetting(key, value));
  },

  async getAll(): Promise<Record<string, string>> {
    if (!isTauriEnv()) return mockSettingsApi.getAll();
    return unwrap(await commands.getAllSettings());
  },

  async getAutoLaunch(): Promise<boolean> {
    if (!isTauriEnv()) return mockSettingsApi.getAutoLaunch();
    return unwrap(await commands.getAutoLaunch());
  },

  async setAutoLaunch(enabled: boolean): Promise<void> {
    if (!isTauriEnv()) return mockSettingsApi.setAutoLaunch(enabled);
    unwrap(await commands.setAutoLaunch(enabled));
  },
};
