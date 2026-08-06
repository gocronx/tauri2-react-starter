import type {
  AppInfo,
  CreateRecordDto,
  RecordItem,
  SystemStats,
  UpdateRecordDto,
} from "@/types";

const STORAGE_KEYS = {
  RECORDS: "mock_records_db",
  SETTINGS: "mock_settings_db",
};

const DEFAULT_MOCK_RECORDS: RecordItem[] = [
  {
    id: "mock-1",
    title: "示例记录 1 (Web Mock 模式)",
    content:
      "当前处于纯前端开发模式 (pnpm dev:renderer)，所有数据通过浏览器 LocalStorage 持久化。",
    status: "active",
    tags: ["starter", "web-mock"],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    title: "跨平台架构已就绪",
    content: "支持 macOS、Windows 与 Linux 桌面原生环境与无边框标题栏自适应。",
    status: "pending",
    tags: ["cross-platform", "tauri2"],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStoredRecords(): RecordItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(DEFAULT_MOCK_RECORDS));
      return DEFAULT_MOCK_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_RECORDS;
  }
}

function saveStoredRecords(records: RecordItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.warn("Failed to save mock records to localStorage", err);
  }
}

function getStoredSettings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw
      ? JSON.parse(raw)
      : { theme: "system", language: "zh", auto_launch: "false" };
  } catch {
    return { theme: "system", language: "zh", auto_launch: "false" };
  }
}

function saveStoredSettings(settings: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed to save mock settings to localStorage", err);
  }
}

export const mockAppApi = {
  async getInfo(): Promise<AppInfo> {
    return {
      name: "tauri2-react-starter (Web Preview)",
      version: "0.1.0-web",
      platform: "browser",
      arch: "wasm/v8",
      app_dir: "localStorage://app-data",
      logs_dir: "localStorage://app-logs",
    };
  },

  async getStats(): Promise<SystemStats> {
    return {
      os: navigator.platform || "Web Browser",
      arch: "x86_64",
      num_cpus: navigator.hardwareConcurrency || 4,
      app_version: "0.1.0-web",
    };
  },

  async openLogsDir(): Promise<void> {
    console.info("[Mock API] Open logs directory requested (browser preview)");
  },

  async openDataDir(): Promise<void> {
    console.info("[Mock API] Open data directory requested (browser preview)");
  },

  async backupDatabase(targetPath: string): Promise<string> {
    const records = getStoredRecords();
    const settings = getStoredSettings();
    const backupJson = JSON.stringify({
      records,
      settings,
      backup_at: new Date().toISOString(),
    });
    localStorage.setItem("mock_database_backup", backupJson);
    return `[Web Mock] 数据库已备份到 LocalStorage: ${targetPath || "mock_database_backup"}`;
  },

  async restoreDatabase(sourcePath: string): Promise<string> {
    const backupJson = localStorage.getItem("mock_database_backup");
    if (!backupJson) {
      throw new Error("未找到可恢复的 LocalStorage 备份");
    }
    const data = JSON.parse(backupJson);
    if (data.records) saveStoredRecords(data.records);
    if (data.settings) saveStoredSettings(data.settings);
    return `[Web Mock] 数据库已从备份成功恢复: ${sourcePath}`;
  },
};

export const mockRecordsApi = {
  async list(query?: string): Promise<RecordItem[]> {
    let records = getStoredRecords();
    if (query && query.trim()) {
      const q = query.toLowerCase();
      records = records.filter(
        (r) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q),
      );
    }
    return records;
  },

  async get(id: string): Promise<RecordItem | null> {
    const records = getStoredRecords();
    return records.find((r) => r.id === id) || null;
  },

  async create(dto: CreateRecordDto): Promise<RecordItem> {
    const records = getStoredRecords();
    const now = new Date().toISOString();
    const newRecord: RecordItem = {
      id: "mock-" + Math.random().toString(36).substring(2, 9),
      title: dto.title,
      content: dto.content || "",
      status: dto.status || "active",
      tags: dto.tags || [],
      created_at: now,
      updated_at: now,
    };
    records.unshift(newRecord);
    saveStoredRecords(records);
    return newRecord;
  },

  async update(dto: UpdateRecordDto): Promise<RecordItem> {
    const records = getStoredRecords();
    const idx = records.findIndex((r) => r.id === dto.id);
    if (idx === -1) {
      throw new Error(`Record with id ${dto.id} not found`);
    }
    const existing = records[idx];
    const updated: RecordItem = {
      ...existing,
      title: dto.title ?? existing.title,
      content: dto.content ?? existing.content,
      status: dto.status ?? existing.status,
      tags: dto.tags ?? existing.tags,
      updated_at: new Date().toISOString(),
    };
    records[idx] = updated;
    saveStoredRecords(records);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const records = getStoredRecords();
    const filtered = records.filter((r) => r.id !== id);
    const deleted = filtered.length !== records.length;
    saveStoredRecords(filtered);
    return deleted;
  },
};

export const mockSettingsApi = {
  async get(key: string): Promise<string | null> {
    const settings = getStoredSettings();
    return settings[key] ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    const settings = getStoredSettings();
    settings[key] = value;
    saveStoredSettings(settings);
  },

  async getAll(): Promise<Record<string, string>> {
    return getStoredSettings();
  },

  async getAutoLaunch(): Promise<boolean> {
    const settings = getStoredSettings();
    return settings["auto_launch"] === "true";
  },

  async setAutoLaunch(enabled: boolean): Promise<void> {
    const settings = getStoredSettings();
    settings["auto_launch"] = String(enabled);
    saveStoredSettings(settings);
  },
};
