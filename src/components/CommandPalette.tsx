import * as React from "react";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Database,
  Settings,
  Plus,
  HardDriveDownload,
  FolderOpen,
  FileText,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
} from "lucide-react";
import { appApi } from "@/lib/api";
import { checkAppUpdate } from "@/lib/updater";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: "dashboard" | "records" | "settings") => void;
  onOpenNewRecordModal?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onOpenNewRecordModal,
}: CommandPaletteProps) {
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void | Promise<void>) => {
    onOpenChange(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette Container */}
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover/95 p-0 text-popover-foreground shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-100">
        <Command label="全局指令面板" className="w-full">
          <div className="flex items-center border-b border-border px-3">
            <span className="mr-2 text-xs font-semibold text-muted-foreground">⌘K</span>
            <Command.Input
              autoFocus
              placeholder="搜索页面、执行快捷操作或切换主题..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              未找到匹配的指令或页面
            </Command.Empty>

            <Command.Group
              heading="页面导航"
              className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              <Command.Item
                onSelect={() => runCommand(() => onNavigate("dashboard"))}
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>仪表盘 (Dashboard)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => onNavigate("records"))}
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Database className="h-4 w-4 text-emerald-500" />
                <span>数据管理 (Records)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => onNavigate("settings"))}
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Settings className="h-4 w-4 text-amber-500" />
                <span>系统设置 (Settings)</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-border" />

            <Command.Group
              heading="快捷操作"
              className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {onOpenNewRecordModal && (
                <Command.Item
                  onSelect={() =>
                    runCommand(() => {
                      onNavigate("records");
                      onOpenNewRecordModal();
                    })
                  }
                  className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>新建数据记录</span>
                </Command.Item>
              )}
              <Command.Item
                onSelect={() =>
                  runCommand(async () => {
                    try {
                      const res = await appApi.backupDatabase("backup_manual.db");
                      toast.success(res || "数据库热备份完成");
                    } catch (e: any) {
                      toast.error("备份失败: " + (e?.message || e));
                    }
                  })
                }
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <HardDriveDownload className="h-4 w-4 text-blue-500" />
                <span>热备份 SQLite 数据库</span>
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(async () => {
                    await appApi.openDataDir();
                    toast.info("已打开应用数据存储目录");
                  })
                }
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <FolderOpen className="h-4 w-4 text-indigo-500" />
                <span>打开数据存储目录</span>
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(async () => {
                    await appApi.openLogsDir();
                    toast.info("已打开运行日志目录");
                  })
                }
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <FileText className="h-4 w-4 text-orange-500" />
                <span>打开运行日志目录</span>
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(async () => {
                    toast.info("正在检查最新版本...");
                    try {
                      const res = await checkAppUpdate();
                      if (res.hasUpdate) {
                        toast.success(`发现新版本 v${res.version}!`);
                      } else {
                        toast.success("已是最新版本 (v0.1.0)");
                      }
                    } catch (e: any) {
                      toast.error("检查更新失败: " + (e?.message || e));
                    }
                  })
                }
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <RefreshCw className="h-4 w-4 text-teal-500" />
                <span>检查应用更新 (Check for Updates)</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-border" />

            <Command.Group
              heading="主题切换"
              className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              <Command.Item
                onSelect={() => runCommand(() => setTheme("light"))}
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>浅色模式 (Light)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme("dark"))}
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>深色模式 (Dark)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme("system"))}
                className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Laptop className="h-4 w-4 text-muted-foreground" />
                <span>跟随系统 (System)</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>使用 ↑ ↓ 键移动选择，Enter 执行，ESC 关闭</span>
            <span className="font-mono text-[10px] opacity-60">⌘K / Ctrl+K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
