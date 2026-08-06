export type Theme = "dark" | "light" | "system";

export type NavTab = "dashboard" | "records" | "settings";

// Re-export auto-generated Rust <-> TS Specta bindings
export type {
  AppInfo,
  SystemStats,
  RecordItem,
  CreateRecordDto,
  UpdateRecordDto,
} from "@/lib/api/bindings";
